import AdmZip from "adm-zip"
import type { GetStaticProps } from "next"
import { usePathname, useSearchParams } from "next/navigation"
import { useRouter } from "next/router"
import { RefObject, useCallback, useEffect, useRef, useState } from "react"

import { EmptySearch, SearchInput, SearchValue, parseSearch } from "@/components/SearchInput"
import { Title } from "@/components/Title"
import { requiredEnv } from "@/lib/env"
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
  bin?: { [name: string]: string }
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

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const searchParamValue = searchParams.get("search")

  useEffect(() => {
    if (searchParamValue != null && searchParamValue !== "") {
      setSearch(parseSearch(searchParamValue) as SearchValue<SearchKeyword>)
    } else {
      setSearch(EmptySearch as SearchValue<SearchKeyword>)
    }
  }, [searchParamValue])

  const handleSearchBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.set("search", e.target.value)
      router.push(
        {
          pathname,
          search: newSearchParams.toString(),
        },
        undefined,
        {
          scroll: false,
        },
      )
    },
    [router],
  )

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
            const lcInput = input.toLowerCase()
            return (
              pkg.name.toLowerCase().includes(lcInput) ||
              pkg.description.toLowerCase().includes(lcInput) ||
              (pkg.bin && Object.keys(pkg.bin).some((name) => name.toLowerCase().includes(lcInput)))
            )
          }) &&
          Object.values(groupBy(search.keywords, "keyword")).every((group) =>
            group.some(({ keyword, value: input }) => {
              const value = pkg[mapKeyword(keyword)]
              const lcInput = input.toLowerCase()
              if (Array.isArray(value)) {
                return value.some((item) => item.toLowerCase().includes(lcInput))
              } else if (typeof value === "string") {
                return value.toLowerCase().includes(lcInput)
              } else {
                return false
              }
            }),
          ),
      ),
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
            onBlur={handleSearchBlur}
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
                  <a href={`#${id}`} aria-label="Anchor link to package">
                    #
                  </a>
                  <span>&nbsp;</span>
                  <a
                    href={`https://github.com/mason-org/mason-registry/blob/${version}/packages/${pkg.name}/package.yaml`}
                    aria-label="External link to package definition"
                  >
                    {pkg.name}
                  </a>
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
                        <a href={pkg.homepage}>{pkg.homepage}</a>
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

                    {pkg.bin &&
                      Object.keys(pkg.bin).map((executable_name, idx) => (
                        <tr key={executable_name}>
                          <td>{idx === 0 && "Executables"}</td>
                          <td>
                            <code>{executable_name}</code>
                          </td>
                        </tr>
                      ))}
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
    await fetch("https://api.github.com/repos/mason-org/mason-registry/releases/latest", {
      headers: {
        Authorization: `Bearer ${requiredEnv("GITHUB_TOKEN")}`,
      },
    })
  ).json()
  const version = latestRelease.tag_name

  const registryZip = await fetch(
    `https://github.com/mason-org/mason-registry/releases/download/${version}/registry.json.zip`,
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
