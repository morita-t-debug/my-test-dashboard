'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabase接続
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [url, setUrl] = useState('https://');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<any>(null);

  // データ読み込み関数
  const fetchResults = async () => {
    const { data, error } = await supabase
      .from('test_result')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) setError(error);
    else setResults(data || []);
  };

  // 初回表示時にデータを取得
  useEffect(() => {
    fetchResults();
  }, []);

  const triggerTest = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/run-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (res.ok) {
        alert('GitHub Actionsを起動しました！1～2分後にリロードしてください。');
      } else {
        alert('起動に失敗しました。APIの設定を確認してください。');
      }
    } catch (e) {
      alert('エラーが発生しました。');
    }
    setLoading(false);
  };

  return (
    <main className="p-10 bg-white min-h-screen text-black">
      <h1 className="text-2xl font-bold mb-6"> テスト実行・確認パネル</h1>
      
      {/* 実行フォーム */}
      <div className="flex gap-2 mb-10 p-4 bg-gray-50 rounded-lg border">
        <input 
          type="text" 
          value={url} 
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 border p-2 rounded text-black"
          placeholder="https://example.com"
        />
        <button 
          onClick={triggerTest}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? '起動中...' : 'テスト実行'}
        </button>
      </div>

      {/* 結果一覧 */}
      <h2 className="text-xl font-bold mb-4 border-b pb-2">過去の実行結果</h2>
      
      {error && (
        <div className="bg-red-100 p-4 text-red-700 rounded-md mb-4">
          エラー発生: {error.message}
        </div>
      )}

      {results.length === 0 ? (
        <div className="p-10 border-2 border-dashed border-gray-200 text-center text-gray-500">
          データがまだありません。
        </div>
      ) : (
        <div className="grid gap-6">
          {results.map((r) => (
            <div key={r.id} className="p-4 border rounded shadow-md bg-white">
              <div className="flex justify-between items-center mb-2">
                <p className="font-bold text-blue-600">{r.url}</p>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  r.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {r.status.toUpperCase()}
                </span>
              </div>
              {r.screenshot && (
                <img 
                  src={`data:image/png;base64,${r.screenshot}`} 
                  alt="screenshot" 
                  className="mt-2 w-full max-w-2xl rounded border shadow-inner"
                />
              )}
              <p className="text-[10px] text-gray-400 mt-2 text-right">
                {new Date(r.created_at).toLocaleString('ja-JP')}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}