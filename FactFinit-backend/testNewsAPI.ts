import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.NEWS_API_KEY || 'd7dd87e9eabe47cfb527ed2128c9139c';
const claim = "Bitcoin price";
const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(claim)}&language=en&sortBy=publishedAt&apiKey=${API_KEY}`;

async function testNewsAPI() {
  console.log('Testing NewsAPI for claim:', claim);

  try {
    const response = await fetch(url);
    const data = await response.json() as { status: string; articles: any[] };

    if (data.status !== "ok") {
      console.error("Error from API:", data);
      return;
    }

    if (data.articles.length === 0) {
      console.log("No articles found for Bitcoin price.");
      return;
    }

    console.log(`\n💰 Top Bitcoin Price News:\n`);
    data.articles.slice(0, 10).forEach((article, index) => {
      console.log(`${index + 1}. ${article.title}`);
      console.log(`   Source: ${article.source.name}`);
      console.log(`   URL: ${article.url}\n`);
    });
  } catch (error) {
    console.error("❌ Error fetching news:", error);
  }
}

testNewsAPI();