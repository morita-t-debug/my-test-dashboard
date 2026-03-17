'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [url, setUrl] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // ステート管理
  const [selectedBrowsers, setSelectedBrowsers] = useState({
    chromium: true,
    firefox: false,
    webkit: false,
  });
  const [takeScreenshot, setTakeScreenshot] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  async function fetchResults() {
    const { data } = await supabase
      .from('test_result')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setResults(data);
  }

  const runTest = async () => {
    setLoading(true);
    // チェックが入っているブラウザ名だけを取り出す
    const browsers = Object.entries(selectedBrowsers)
      .filter(([_, checked]) => checked)
      .map(([name]) => name);

    if (browsers.length === 0) {
      alert("ブラウザを選択してください");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/run-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, browsers, takeScreenshot }),
      });

      if (res.ok) alert('起動成功');
      else alert('起動失敗');
    } catch (err) {
      alert('エラー');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>検品システム</h1>

      <div>
        <label>調査URL: </label>
        <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} />
      </div>

      <div style={{ margin: '10px 0' }}>
        <p>ブラウザ選択:</p>
        <label><input type="checkbox" checked={selectedBrowsers.chromium} onChange={(e) => setSelectedBrowsers({...selectedBrowsers, chromium: e.target.checked})} /> Chromium</label><br/>
        <label><input type="checkbox" checked={selectedBrowsers.firefox} onChange={(e) => setSelectedBrowsers({...selectedBrowsers, firefox: e.target.checked})} /> Firefox</label><br/>
        <label><input type="checkbox" checked={selectedBrowsers.webkit} onChange={(e) => setSelectedBrowsers({...selectedBrowsers, webkit: e.target.checked})} /> Safari(Webkit)</label>
      </div>

      <div style={{ margin: '10px 0' }}>
        <label>
          <input type="checkbox" checked={takeScreenshot} onChange={(e) => setTakeScreenshot(e.target.checked)} />
          スクリーンショットを撮る
        </label>
      </div>

      <button onClick={runTest} disabled={loading}>{loading ? '送信中...' : 'テスト実行'}</button>

      <hr />

      <h2>結果一覧</h2>
      {results.map((r) => (
        <div key={r.id} style={{ marginBottom: '20px', borderBottom: '1px solid #ccc' }}>
          <p>URL: {r.url} | ステータス: {r.status}</p>
          {r.screenshot && r.screenshot !== 'no_image_yet' && (
            <img src={`data:image/png;base64,${r.screenshot}`} style={{ width: '400px' }} />
          )}
        </div>
      ))}
    </div>
  );
}