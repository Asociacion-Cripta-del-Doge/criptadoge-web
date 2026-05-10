import { useEffect, useMemo, useState } from "react";
import { WEB_TEXT_DEFAULTS, type WebTextKey } from "../data/webTextDefaults";
import { fetchWebTexts } from "../services/webTextsService";

type TextMap = Partial<Record<WebTextKey, string>>;

export function useWebTexts(section?: string, locale = "es") {
  const [remoteTexts, setRemoteTexts] = useState<TextMap>({});

  useEffect(() => {
    let isMounted = true;

    fetchWebTexts(section, locale)
      .then((texts) => {
        if (!isMounted) return;

        const nextTexts = texts.reduce<TextMap>((acc, text) => {
          if (text.key in WEB_TEXT_DEFAULTS) {
            acc[text.key as WebTextKey] = text.value;
          }
          return acc;
        }, {});

        setRemoteTexts(nextTexts);
      })
      .catch(() => {
        if (isMounted) {
          setRemoteTexts({});
        }
      });

    return () => {
      isMounted = false;
    };
  }, [locale, section]);

  return useMemo(
    () => (key: WebTextKey) => remoteTexts[key] ?? WEB_TEXT_DEFAULTS[key],
    [remoteTexts],
  );
}
