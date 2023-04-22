import Link from "next/link"

export default function Home() {
  return (
    <main>
      <h1>About</h1>
      <p>
        Mason is a portable package manager for Neovim that runs everywhere Neovim runs. It allows you to easily install
        and manage LSP servers, DAP servers, linters, and formatters.
      </p>
      <p>
        For a list of all available packages in the{" "}
        <a href="https://github.com/mason-org/mason-registry">core registry</a>, refer to the{" "}
        <Link href="/registry/list">Package list</Link>.
      </p>
      <p>
        For more information about the Neovim plugin, <code>mason.nvim</code>, refer to{" "}
        <a href="https://github.com/williamboman/mason.nvim">williamboman/mason.nvim</a>.
      </p>
    </main>
  )
}
