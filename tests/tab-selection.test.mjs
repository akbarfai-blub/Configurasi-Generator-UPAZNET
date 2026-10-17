import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { selectTargetTab, normalizePath } from '../scripts/verify-ui.mjs';

describe('Chrome DevTools Target Selection (selectTargetTab)', () => {
  const syntheticTabs = [
    {
      id: 'tab-1',
      title: 'Google Search',
      type: 'page',
      url: 'https://www.google.com/',
      webSocketDebuggerUrl: 'ws://localhost:9222/devtools/page/tab-1',
    },
    {
      id: 'tab-2',
      title: 'Upaznet Localhost 3000',
      type: 'page',
      url: 'http://localhost:3000/',
      webSocketDebuggerUrl: 'ws://localhost:9222/devtools/page/tab-2',
    },
    {
      id: 'tab-3',
      title: 'Upaznet Custom Port & Path',
      type: 'page',
      url: 'http://localhost:3001/custom-app/',
      webSocketDebuggerUrl: 'ws://localhost:9222/devtools/page/tab-3',
    },
    {
      id: 'tab-4',
      title: 'No WebSocket Debugger',
      type: 'page',
      url: 'http://localhost:3002/no-debug',
      webSocketDebuggerUrl: null,
    },
    {
      id: 'tab-5',
      title: 'Background Page',
      type: 'background_page',
      url: 'http://localhost:3003/',
      webSocketDebuggerUrl: 'ws://localhost:9222/devtools/page/tab-5',
    },
  ];

  test('1. URL default (http://localhost:3000) memilih tab aplikasi yang benar', () => {
    const selected = selectTargetTab(syntheticTabs, 'http://localhost:3000');
    assert.equal(selected.id, 'tab-2');
    assert.equal(selected.title, 'Upaznet Localhost 3000');
    assert.equal(selected.webSocketDebuggerUrl, 'ws://localhost:9222/devtools/page/tab-2');
  });

  test('2. APP_URL dengan port/path berbeda memilih target yang sesuai meskipun ada tab localhost:3000', () => {
    const selected = selectTargetTab(syntheticTabs, 'http://localhost:3001/custom-app');
    assert.equal(selected.id, 'tab-3');
    assert.equal(selected.title, 'Upaznet Custom Port & Path');
  });

  test('3. Tab pertama yang tidak cocok tidak boleh dipilih (tidak ada fallback ke tabs[0])', () => {
    const selected = selectTargetTab(syntheticTabs, 'http://localhost:3000/');
    assert.notEqual(selected.id, 'tab-1', 'Tab pertama (google.com) tidak boleh dipilih');
    assert.equal(selected.id, 'tab-2');
  });

  test('4. Target yang tidak ditemukan menghasilkan kegagalan jelas tanpa fallback', () => {
    assert.throws(
      () => {
        selectTargetTab(syntheticTabs, 'http://localhost:8080/nonexistent');
      },
      (err) => {
        assert.match(err.message, /tidak ditemukan atau tidak memiliki webSocketDebuggerUrl aktif/);
        return true;
      }
    );
  });

  test('5a. URL tidak valid menghasilkan error validasi jelas', () => {
    assert.throws(
      () => {
        selectTargetTab(syntheticTabs, 'bukan-url-valid');
      },
      (err) => {
        assert.match(err.message, /APP_URL tidak valid/);
        return true;
      }
    );
  });

  test('5b. Target tanpa koneksi debugger (webSocketDebuggerUrl: null) tidak digunakan', () => {
    assert.throws(
      () => {
        selectTargetTab(syntheticTabs, 'http://localhost:3002/no-debug');
      },
      (err) => {
        assert.match(err.message, /tidak ditemukan atau tidak memiliki webSocketDebuggerUrl aktif/);
        return true;
      }
    );
  });

  test('5c. Target non-page (misal background_page) diabaikan', () => {
    assert.throws(
      () => {
        selectTargetTab(syntheticTabs, 'http://localhost:3003/');
      },
      (err) => {
        assert.match(err.message, /tidak ditemukan atau tidak memiliki webSocketDebuggerUrl aktif/);
        return true;
      }
    );
  });

  test('6a. Target tanpa properti type ditolak meskipun URL dan debugger cocok', () => {
    const tabsWithoutType = [
      {
        id: 'no-type',
        title: 'Matching URL but missing type',
        url: 'http://localhost:3000/',
        webSocketDebuggerUrl: 'ws://localhost:9222/devtools/page/no-type',
      },
    ];
    assert.throws(
      () => {
        selectTargetTab(tabsWithoutType, 'http://localhost:3000');
      },
      (err) => {
        assert.match(err.message, /tidak ditemukan atau tidak memiliki webSocketDebuggerUrl aktif/);
        return true;
      }
    );
  });

  test('6b. Target dengan type null ditolak meskipun URL dan debugger cocok', () => {
    const tabsWithNullType = [
      {
        id: 'null-type',
        title: 'Matching URL but null type',
        type: null,
        url: 'http://localhost:3000/',
        webSocketDebuggerUrl: 'ws://localhost:9222/devtools/page/null-type',
      },
    ];
    assert.throws(
      () => {
        selectTargetTab(tabsWithNullType, 'http://localhost:3000');
      },
      (err) => {
        assert.match(err.message, /tidak ditemukan atau tidak memiliki webSocketDebuggerUrl aktif/);
        return true;
      }
    );
  });

  test('6c. Target dengan type string kosong ditolak meskipun URL dan debugger cocok', () => {
    const tabsWithEmptyType = [
      {
        id: 'empty-type',
        title: 'Matching URL but empty string type',
        type: '',
        url: 'http://localhost:3000/',
        webSocketDebuggerUrl: 'ws://localhost:9222/devtools/page/empty-type',
      },
    ];
    assert.throws(
      () => {
        selectTargetTab(tabsWithEmptyType, 'http://localhost:3000');
      },
      (err) => {
        assert.match(err.message, /tidak ditemukan atau tidak memiliki webSocketDebuggerUrl aktif/);
        return true;
      }
    );
  });

  test('6d. Target type \'page\' dengan URL dan debugger yang cocok tetap diterima', () => {
    const validTabs = [
      {
        id: 'valid-page',
        title: 'Valid Page Target',
        type: 'page',
        url: 'http://localhost:3000/',
        webSocketDebuggerUrl: 'ws://localhost:9222/devtools/page/valid-page',
      },
    ];
    const selected = selectTargetTab(validTabs, 'http://localhost:3000');
    assert.equal(selected.id, 'valid-page');
    assert.equal(selected.type, 'page');
  });

  test('Helper normalizePath membersihkan trailing slash dengan benar', () => {
    assert.equal(normalizePath(''), '/');
    assert.equal(normalizePath('/'), '/');
    assert.equal(normalizePath('/app/'), '/app');
    assert.equal(normalizePath('/app///'), '/app');
    assert.equal(normalizePath('/app'), '/app');
  });
});
