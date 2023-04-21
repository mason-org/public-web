import AdmZip from "adm-zip";
import Head from "next/head";
import type { GetStaticProps } from "next";
import { List, ListItem } from "../../components/List";

import styles from "./list.module.css";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";

type Package = {
  name: string;
  description: string;
  homepage: string;
  licenses: string[];
  categories: string[];
  languages: string[];
  source: { id: string };
};

type Props = {
  packages: Package[];
  checksum: string;
  version: string;
  timestamp: string;
};

export default function RegistryList({
  packages,
  checksum,
  timestamp,
  version,
}: Props) {
  const [filteredPackages, setFilteredPackages] = useState(packages);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const [search, setSearch] = useState<string>("");
  const handleSearchChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setSearch(event.target.value);
    },
    []
  );

  useEffect(() => {
    const trimmedSearch = search.trim();
    const containsUpperCase = /[A-Z]/.test(trimmedSearch);

    const normalize = (value: string) =>
      containsUpperCase ? value : value.toLowerCase();

    if (trimmedSearch === "") {
      setFilteredPackages(packages);
    } else {
      setFilteredPackages(
        packages.filter((pkg) => {
          return (
            normalize(pkg.name).includes(trimmedSearch) ||
            pkg.languages.some((language) =>
              normalize(language).includes(trimmedSearch)
            ) ||
            pkg.categories.some((category) =>
              normalize(category).includes(trimmedSearch)
            )
          );
        })
      );
    }
  }, [search, packages]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "/") {
        if (searchRef.current) {
          searchRef.current.focus();
        }
      }
    };
    document.addEventListener("keyup", handleKeyDown);

    return () => {
      document.removeEventListener("keyup", handleKeyDown);
    };
  });

  return (
    <>
      <Head>
        <title>Mason Registry packages | mason-registry.dev</title>
      </Head>
      <main>
        <h1>Package list</h1>

        <input
          className={styles["input"]}
          ref={searchRef}
          id="search"
          value={search}
          type="search"
          placeholder="Search"
          onChange={handleSearchChange}
        />

        <List as="ol">
          {filteredPackages.map((pkg) => {
            const id = encodeURIComponent(pkg.name);
            return (
              <ListItem key={pkg.name}>
                <h2 id={id}>
                  <a href={`#${id}`}>#</a> {pkg.name}
                </h2>
                <p>{pkg.description}</p>
                <table className={styles["table"]}>
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
                            onClick={() => setSearch(category)}
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
                            onClick={() => setSearch(language)}
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
                <pre className={styles["pre"]}>:MasonInstall {pkg.name}</pre>
              </ListItem>
            );
          })}
        </List>
      </main>
      <footer>
        <table className={styles["table"]}>
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
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const timestamp = new Date().toISOString();
  const latestRelease = await (
    await fetch(
      "https://api.github.com/repos/mason-org/mason-registry/releases/latest"
    )
  ).json();
  const version = latestRelease.tag_name;

  const registryZip = await fetch(
    `https://github.com/mason-org/mason-registry/releases/download/${version}/registry.json.zip`
  );

  const zip = new AdmZip(Buffer.from(await registryZip.arrayBuffer()));
  const packages: Package[] = JSON.parse(zip.readAsText("registry.json"));

  packages.sort((a, b) => a.name.localeCompare(b.name));
  const checksums = await (
    await fetch(
      `https://github.com/mason-org/mason-registry/releases/download/${version}/checksums.txt`
    )
  ).text();

  const checksum = checksums
    .split("\n")
    .filter((line) => line !== "")
    .map((line) => line.split("  "))
    .map(([checksum, file]) => ({ checksum, file }))
    .find((entry) => entry.file == "registry.json")?.checksum;

  return {
    props: {
      version,
      packages,
      checksum: checksum ?? "N/A",
      timestamp,
    },
  };
};
