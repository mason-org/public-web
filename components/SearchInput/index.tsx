import { ChangeEvent, HTMLAttributes, useCallback } from "react"

export type SearchValue<Keyword> = {
  values: string[]
  keywords: { keyword: Keyword; value: string }[]
  raw: string
}

type Props<Keyword> = Omit<HTMLAttributes<HTMLInputElement>, "value" | "onChange"> & {
  value: SearchValue<Keyword>
  onChange: (search: SearchValue<Keyword>) => void
}

export function parseSearch(search: string): SearchValue<unknown> {
  // giggity
  const components = search
    .split(/\s+(?=(?:[^"]*"[^"]*")*[^"]*$)/g)
    .map((val) => val.trim().match(/^(?:(?<keyword>[^:]+):)?(?<value>.+)$/))
    .filter((x): x is RegExpMatchArray => x != null)
    .map((match) => ({
      value: match.groups?.value?.match(/([^"]+)/)?.[1],
      keyword: match.groups?.keyword,
    }))

  const values = components
    .filter(({ keyword }) => keyword == null)
    .map(({ value }) => value?.match(/([^"]+)/)?.[1])
    .filter((x): x is string => x != null)

  const keywords = components
    .filter(({ keyword }) => keyword != null)
    .filter((x): x is { keyword: string; value: string } => x.keyword != null && x.value != null)

  return { raw: search, values, keywords } satisfies SearchValue<unknown>
}

export const EmptySearch: Readonly<SearchValue<unknown>> = {
  raw: "",
  values: [],
  keywords: [],
}

export function SearchInput<Keyword>({ value, onChange, ...rest }: Props<Keyword>) {
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (event.target.value === "") {
        onChange(EmptySearch as SearchValue<Keyword>)
      } else {
        onChange(parseSearch(event.target.value) as SearchValue<Keyword>)
      }
    },
    [onChange]
  )

  return <input {...rest} type="search" value={value.raw} onChange={handleChange} />
}
