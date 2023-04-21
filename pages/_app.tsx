import "@/styles/globals.css";
import { AppProps } from "next/app";
import Head from "next/head";
import Link from "next/link";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta content="width=device-width, initial-scale=1" name="viewport" />
      </Head>
      <header>
        <nav>
          <ul>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/registry/list">Package list</Link>
            </li>
            <li>
              <a
                target="_blank"
                href="https://github.com/williamboman/mason.nvim"
              >
                mason.nvim
              </a>
            </li>
            <li>
              <a
                target="_blank"
                href="https://github.com/mason-org/mason-registry"
              >
                mason-registry
              </a>
            </li>
          </ul>
        </nav>
        <h1>mason-registry.dev</h1>
      </header>
      <Component {...pageProps} />
    </>
  );
}
