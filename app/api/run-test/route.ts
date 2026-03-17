import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // 画像から送られてくるデータを受け取る
    const { url, browsers, takeScreenshot } = await req.json();

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_REPO = process.env.GITHUB_REPO;

    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/playwright.yml/dispatches`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28', //APIバージョンの指定
        },
        body: JSON.stringify({
          ref: 'main', 
          inputs: { 
            target_url: url,
            browsers: browsers.join(','),
            take_screenshot: String(takeScreenshot) 
          },
        }),
      }
    );

    if (res.ok) {
      return NextResponse.json({ message: 'Success' });
    } else {
      const errorText = await res.text();
      console.error('GitHub API Error:', errorText); // ターミナルでエラーを確認できるように
      return NextResponse.json({ error: errorText }, { status: res.status });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}