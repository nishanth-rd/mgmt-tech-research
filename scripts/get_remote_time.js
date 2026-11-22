#!/usr/bin/env node

/**
 * Multi-Server Remote Time Synchronizer
 * Queries atomic NTP servers (UDP port 123) with sequential failover,
 * and falls back to verified HTTPS date endpoints if NTP is unreachable.
 * 
 * Target NTP Servers:
 * 1. time.cloudflare.com
 * 2. time.google.com
 * 3. time.aws.com
 * 4. pool.ntp.org
 */

const dgram = require('dgram');
const https = require('https');

const NTP_SERVERS = [
  'time.cloudflare.com',
  'time.google.com',
  'time.aws.com',
  'pool.ntp.org'
];

const HTTPS_FALLBACKS = [
  'https://worldtimeapi.org/api/timezone/Etc/UTC',
  'https://api.github.com'
];

function queryNTP(server, timeoutMs = 2500) {
  return new Promise((resolve, reject) => {
    const client = dgram.createSocket('udp4');
    const packet = Buffer.alloc(48);
    // Standard NTP client request: LI=0, VN=3, Mode=3 (client)
    packet[0] = 0x1B;

    const timer = setTimeout(() => {
      try { client.close(); } catch (_) {}
      reject(new Error(`Timeout querying NTP server: ${server}`));
    }, timeoutMs);

    client.send(packet, 0, packet.length, 123, server, (err) => {
      if (err) {
        clearTimeout(timer);
        try { client.close(); } catch (_) {}
        return reject(err);
      }
    });

    client.on('message', (msg) => {
      clearTimeout(timer);
      try { client.close(); } catch (_) {}
      if (msg.length < 48) {
        return reject(new Error(`Invalid NTP packet length: ${msg.length}`));
      }
      // Transmit Timestamp is at byte offset 40 (seconds since Jan 1, 1900)
      const secondsSince1900 = msg.readUInt32BE(40);
      const epochSeconds = secondsSince1900 - 2208988800;
      const date = new Date(epochSeconds * 1000);
      resolve({
        server,
        source: 'NTP (UDP:123)',
        isoDate: date.toISOString(),
        year: date.getUTCFullYear()
      });
    });

    client.on('error', (err) => {
      clearTimeout(timer);
      try { client.close(); } catch (_) {}
      reject(err);
    });
  });
}

function queryHttpsFallback(url, timeoutMs = 4000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'Research-Portal-TimeSync' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (url.includes('worldtimeapi.org')) {
          try {
            const parsed = JSON.parse(data);
            if (parsed.utc_datetime) {
              const date = new Date(parsed.utc_datetime);
              return resolve({
                server: url,
                source: 'HTTPS API',
                isoDate: date.toISOString(),
                year: date.getUTCFullYear()
              });
            }
          } catch (_) {}
        }
        
        // Use HTTP Date header if present
        const dateHeader = res.headers['date'];
        if (dateHeader) {
          const date = new Date(dateHeader);
          if (!isNaN(date.getTime())) {
            return resolve({
              server: url,
              source: 'HTTPS Date Header',
              isoDate: date.toISOString(),
              year: date.getUTCFullYear()
            });
          }
        }
        reject(new Error(`Failed to extract date from HTTPS endpoint: ${url}`));
      });
    });

    req.setTimeout(timeoutMs, () => {
      req.destroy();
      reject(new Error(`HTTPS timeout querying: ${url}`));
    });

    req.on('error', reject);
  });
}

async function getRemoteTime() {
  // 1. Try NTP Servers in priority order
  for (const s of NTP_SERVERS) {
    try {
      const result = await queryNTP(s);
      return result;
    } catch (e) {
      // Continue to next time server
    }
  }

  // 2. Try HTTPS fallbacks if NTP fails
  for (const h of HTTPS_FALLBACKS) {
    try {
      const result = await queryHttpsFallback(h);
      return result;
    } catch (e) {
      // Continue to next fallback
    }
  }

  throw new Error('All remote NTP and HTTPS time servers were unreachable.');
}

if (require.main === module) {
  getRemoteTime()
    .then(res => {
      console.log(JSON.stringify(res, null, 2));
      process.exit(0);
    })
    .catch(err => {
      console.error('ERROR: Could not resolve remote time:', err.message);
      process.exit(1);
    });
}

module.exports = { getRemoteTime, NTP_SERVERS, HTTPS_FALLBACKS };
