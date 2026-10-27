# Wytyczne

[wytyczne.twojaginekolog.pl](https://wytyczne.twojaginekolog.pl)

Polskie wytyczne, zalecenia, rekomendacje i stanowiska ginekologiczne oraz położnicze.

241 dokumentów w katalogu · 221 PDF · 5 pełnych tekstów HTML · 2044 przypisania słów kluczowych.

Wyszukiwanie obsługuje skróty kliniczne, polskie znaki, odmianę słów, podpowiedzi literówek i warianty zapisu markerów (np. CIN3/CIN 3, Ki67/Ki-67). Wyniki są sortowane według trafności; dostępne są filtry tematu, zbioru, języka i plików.

Przy każdym dokumencie podano instytucję, datę, język, źródło i status wersji. Starsze wersje i przekłady międzynarodowe mają osobne filtry. Dla 15 rekordów bez lokalnego tekstu podano źródło i powód w metadanych. Data przeglądu: 27.10.2026.

## Pliki

- `index.html` — gotowa strona, bez zewnętrznych bibliotek.
- `dokumenty/` — oryginalne PDF i zapisane teksty HTML.
- `katalog.json`, `katalog.csv` — metadane i słowa kluczowe.
- `src/` — szablon i wyszukiwarka.
- `tests/search-report.json` — wyniki testów wyszukiwania.

## Uruchomienie

Otwórz `index.html` w przeglądarce. Opcjonalnie: `python3 -m http.server 8000`.

Budowanie: `node scripts/build.cjs`.

Testy: `node scripts/test-search.cjs`.

Dokumenty źródłowe zachowują autorstwo i oznaczenia praw wydawców. Repozytorium nie nadaje im nowej licencji.
