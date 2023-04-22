import AdmZip from "adm-zip"
import type { GetStaticProps } from "next"
import { RefObject, useEffect, useRef, useState } from "react"

import { EmptySearch, SearchInput, SearchValue, parseSearch } from "@/components/SearchInput"
import { Title } from "@/components/Title"
import { groupBy } from "@/lib/functional"

import styles from "./list.module.css"
import { List, ListItem } from "../../components/List"

type Package = {
  name: string
  description: string
  homepage: string
  licenses: string[]
  categories: string[]
  languages: string[]
  source: { id: string }
}

type Props = {
  packages: Package[]
  checksum: string
  version: string
  timestamp: string
}

const useVimSearchKeybind = (inputRef: RefObject<HTMLInputElement>) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "/") {
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }
    }
    document.addEventListener("keyup", handleKeyDown)

    return () => {
      document.removeEventListener("keyup", handleKeyDown)
    }
  })
}

type SearchKeyword = "language" | "category"

function mapKeyword(keyword: SearchKeyword): keyof Package {
  switch (keyword) {
    case "language":
      return "languages"
    case "category":
      return "categories"
  }
}

export default function RegistryList({ packages, checksum, timestamp, version }: Props) {
  const [filteredPackages, setFilteredPackages] = useState(packages)
  const searchRef = useRef<HTMLInputElement>(null)
  const [search, setSearch] = useState<SearchValue<SearchKeyword>>(EmptySearch as SearchValue<SearchKeyword>)

  useVimSearchKeybind(searchRef)

  useEffect(() => {
    if (search === EmptySearch) {
      setFilteredPackages(packages)
      return
    }

    setFilteredPackages(
      packages.filter(
        (pkg) =>
          search.values.every((input) => {
            return (
              pkg.name.toLowerCase().includes(input.toLowerCase()) ||
              pkg.description.toLowerCase().includes(input.toLowerCase())
            )
          }) &&
          groupBy(search.keywords, "keyword").every((group) =>
            group.some(({ keyword, value }) => {
              const input = pkg[mapKeyword(keyword)]
              if (Array.isArray(input)) {
                return input.some((item) => item.toLowerCase().includes(value.toLowerCase()))
              } else if (typeof input === "string") {
                return input.toLowerCase().includes(value.toLowerCase())
              } else {
                return false
              }
            })
          )
      )
    )
  }, [search, packages])

  return (
    <>
      <Title title="Package list" />
      <main>
        <header>
          <h1>Package list</h1>

          <SearchInput
            id="search"
            ref={searchRef}
            placeholder="Search"
            className={styles.input}
            value={search}
            onChange={setSearch}
          />
          <p>
            <small>
              Examples: <code>language:&quot;standard ml&quot; category:lsp</code> |{" "}
              <code>language:json category:lsp openapi</code>
            </small>
          </p>
        </header>

        <List as="ol">
          {filteredPackages.map((pkg) => {
            const id = encodeURIComponent(pkg.name)
            return (
              <ListItem key={pkg.name}>
                <h2 id={id}>
                  <a href={`#${id}`}>#</a> {pkg.name}
                </h2>
                <p>{pkg.description}</p>
                <table className={styles.table}>
                  <tbody>
                    <tr>
                      <td title="Package URL">purl</td>
                      <td>
                        <code>{pkg.source.id}</code>
                      </td>
                    </tr>

                    <tr>
                      <td>Homepage</td>
                      <td>
                        <a href={pkg.homepage} target="_blank">
                          {pkg.homepage}
                        </a>
                      </td>
                    </tr>

                    <tr>
                      <td>Category</td>
                      <td>
                        {pkg.categories.map((category) => (
                          <a
                            key={category}
                            href="#search"
                            onClick={() => setSearch(parseSearch(`category:${category}`) as SearchValue<SearchKeyword>)}
                          >
                            <code>{category}</code>
                          </a>
                        ))}
                      </td>
                    </tr>

                    <tr>
                      <td>Language</td>
                      <td>
                        {pkg.languages.map((language) => (
                          <a
                            key={language}
                            href="#search"
                            onClick={() => setSearch(parseSearch(`language:${language}`) as SearchValue<SearchKeyword>)}
                          >
                            <code>{language}</code>
                          </a>
                        ))}
                      </td>
                    </tr>

                    <tr>
                      <td title="SPDX License Identifier">License</td>
                      <td>
                        {pkg.licenses.map((license) => (
                          <code key={license}>{license}</code>
                        ))}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <pre className={styles.pre}>:MasonInstall {pkg.name}</pre>
              </ListItem>
            )
          })}
        </List>
      </main>
      <footer>
        <table className={styles.table}>
          <tbody>
            <tr>
              <td>Last updated</td>
              <td>
                <time dateTime={timestamp}>{timestamp}</time>
              </td>
            </tr>
            <tr>
              <td>Version</td>
              <td>
                <code>{version}</code>
              </td>
            </tr>
            <tr>
              <td>Checksum</td>
              <td>{checksum}</td>
            </tr>
          </tbody>
        </table>
      </footer>
    </>
  )
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const timestamp = new Date().toISOString()
  const latestRelease = await (
    await fetch("https://api.github.com/repos/mason-org/mason-registry/releases/latest")
  ).json()
  const version = latestRelease.tag_name

  const registryZip = await fetch(
    `https://github.com/mason-org/mason-registry/releases/download/${version}/registry.json.zip`
  )

  const zip = new AdmZip(Buffer.from(await registryZip.arrayBuffer()))
  const packages: Package[] = JSON.parse(zip.readAsText("registry.json"))

  packages.sort((a, b) => a.name.localeCompare(b.name))
  const checksums = await (
    await fetch(`https://github.com/mason-org/mason-registry/releases/download/${version}/checksums.txt`)
  ).text()

  const checksum = checksums
    .split("\n")
    .filter((line) => line !== "")
    .map((line) => line.split("  "))
    .map(([checksum, file]) => ({ checksum, file }))
    .find((entry) => entry.file === "registry.json")?.checksum

  return {
    props: {
      version,
      packages,
      checksum: checksum ?? "N/A",
      timestamp,
    },
    revalidate: 1800,
  }
}
