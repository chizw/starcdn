import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const config = await readFile(new URL('./next.config.ts', import.meta.url), 'utf8');

test('Next dev rewrites include CDN proxy routes', () => {
  for (const route of ['/npm', '/gh', '/ajax/libs', '/avatar']) {
    assert.match(config, new RegExp(`['"]${route.replaceAll('/', '\\/')}['"]`));
  }
  assert.match(config, /source:\s*`\$\{route\}\/\:path\*`/);
  assert.match(config, /destination:\s*`\$\{backendUrl\}\$\{route\}\/\:path\*`/);
});

test('Next config does not force trailing slashes', () => {
  assert.doesNotMatch(config, /trailingSlash:\s*true/);
});
