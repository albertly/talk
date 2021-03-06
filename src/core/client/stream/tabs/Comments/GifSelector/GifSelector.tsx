import { Localized } from "@fluent/react/compat";
import React, {
  ChangeEvent,
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { GiphyGif } from "coral-common/rest/external/giphy";
import { useFetch } from "coral-framework/lib/relay";
import {
  BaseButton,
  Button,
  ButtonIcon,
  Flex,
  HorizontalGutter,
  InputLabel,
  TextField,
} from "coral-ui/components/v2";

import { GIF_RESULTS_LIMIT, GifSearchFetch } from "./GifSearchFetch";
import GiphyAttribution from "./GiphyAttribution";

import styles from "./GifSelector.css";

interface Props {
  onGifSelect: (gif: GiphyGif) => void;
}

const GifSelector: FunctionComponent<Props> = (props) => {
  const gifSearchFetch = useFetch(GifSearchFetch);
  const [results, setResults] = useState<GiphyGif[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState<string>("");
  const [hasNextPage, setHasNextPage] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const onSearchFieldChange = useCallback(
    (evt: ChangeEvent<HTMLInputElement>) => {
      setQuery(evt.target.value);
    },
    []
  );
  const searchInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // TODO: why doesn't this work?
    if (searchInput && searchInput.current) {
      searchInput.current.focus();
    }
  }, []);

  useEffect(() => {
    async function search() {
      try {
        const res = await gifSearchFetch({ query, page });
        const { pagination, data } = res;
        if (pagination.total_count > pagination.offset * GIF_RESULTS_LIMIT) {
          setHasNextPage(true);
        } else {
          setHasNextPage(false);
        }
        setSearchError(null);
        setResults(data);
      } catch (error) {
        setSearchError(error.message);
      }

      setIsLoading(false);
    }

    let timeout: any | null = null;

    if (query && query.length > 1) {
      setIsLoading(true);

      timeout = setTimeout(() => {
        timeout = null;
        void search();
      }, 200);
    } else {
      setPage(0);
      setResults([]);
      setIsLoading(false);
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [query, page, setResults, setIsLoading, setPage]);
  const nextPage = useCallback(() => {
    setPage(page + 1);
  }, [page]);
  const prevPage = useCallback(() => {
    setPage(page - 1);
  }, [page]);
  const onGifSelect = useCallback((gif: GiphyGif) => {
    setResults([]);
    setPage(0);
    setHasNextPage(false);
    setQuery("");
    props.onGifSelect(gif);
  }, []);
  return (
    <div className={styles.root}>
      <HorizontalGutter>
        <HorizontalGutter>
          <Localized id="comments-postComment-gifSearch">
            <InputLabel>Search for a GIF</InputLabel>
          </Localized>
          <TextField
            className={styles.input}
            value={query}
            onChange={onSearchFieldChange}
            fullWidth
            variant="seamlessAdornment"
            color="streamBlue"
            adornment={
              <Button color="stream" className={styles.searchButton}>
                <ButtonIcon>search</ButtonIcon>
              </Button>
            }
          />
        </HorizontalGutter>
        {isLoading && (
          <Localized id="comments-postComment-gifSearch-loading">
            <p className={styles.loading}>Loading...</p>
          </Localized>
        )}
        {results.length > 0 && (
          <>
            <div>
              <Flex className={styles.results} justifyContent="space-evenly">
                {results.slice(0, results.length / 2).map((result) => (
                  <BaseButton
                    key={result.id}
                    onClick={() => onGifSelect(result)}
                    className={styles.result}
                  >
                    <img
                      src={result.images.fixed_height_downsampled.url}
                      alt={result.title}
                      className={styles.resultImg}
                    />
                  </BaseButton>
                ))}
              </Flex>
              <Flex className={styles.results} justifyContent="space-evenly">
                {results
                  .slice(results.length / 2, results.length)
                  .map((result) => (
                    <BaseButton
                      className={styles.result}
                      key={result.id}
                      onClick={() => onGifSelect(result)}
                    >
                      <img
                        src={result.images.fixed_height_downsampled.url}
                        alt={result.title}
                        className={styles.resultImg}
                      />
                    </BaseButton>
                  ))}
              </Flex>
            </div>
            <GiphyAttribution />
          </>
        )}
        {results.length > 0 && (
          <Flex
            justifyContent={
              results.length > 0 && hasNextPage && page > 0
                ? "space-between"
                : "flex-end"
            }
          >
            {results.length > 0 && page > 0 && (
              <Button
                onClick={prevPage}
                variant="outlined"
                color="stream"
                iconLeft
              >
                <ButtonIcon>keyboard_arrow_left</ButtonIcon>
                Previous
              </Button>
            )}
            {results.length > 0 && hasNextPage && (
              <Button
                onClick={nextPage}
                variant="outlined"
                color="stream"
                iconRight
              >
                Next
                <ButtonIcon>keyboard_arrow_right</ButtonIcon>
              </Button>
            )}
          </Flex>
        )}
        {searchError && <p className={styles.error}>{searchError}</p>}
        {!isLoading &&
          !searchError &&
          results.length === 0 &&
          query.length > 1 && (
            <Localized
              id="comments-postComment-gifSearch-no-results"
              $query={query}
            >
              <p className={styles.noResults}>
                No results found for "{query}"{" "}
              </p>
            </Localized>
          )}
      </HorizontalGutter>
    </div>
  );
};

export default GifSelector;
