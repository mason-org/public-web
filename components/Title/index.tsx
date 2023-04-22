import Head from "next/head"

type Props = {
  title?: string
}

export function Title({ title }: Props) {
  return (
    <Head>
      <title>{title ? `${title} | mason-registry.dev` : "mason-registry.dev"}</title>
    </Head>
  )
}
