# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2025-11-07

### Added

- Allow specifying alternate configuration file via `--config <file>` / `-c <file>` or `MOCK_CONFIG` environment variable (falls back to `mock_config.json`).

### Fixed

- Avoid throwing a PathError when running with newer Express/path-to-regexp versions by removing the invalid `router.use('*', ...)` catch-all pattern. The router now uses an unscoped middleware and derives the remaining request path from `req.params[0]` / `req.path`, improving compatibility with Express 5.

## [0.1.0] - 2025-08-23

### Added

- Initial release of filesystem-driven mock API server
- Support for JSONC `mock_config.json` with `default_response`, `mocks`, and `proxies`
- Dynamic route segment handling using double-underscore directory names (e.g., `__id__`)
- Per-method mock handlers via `GET.json`, `POST.js`, etc., with `ANY.(js|json)` fallbacks
- Proxy forwarding with optional path rewrite and origin change
- HTTPS support via self-signed certificates (`certs/` directory)
- Structured test suite (unit, integration, end-to-end) using Vitest & Supertest
- Colored structured request logging middleware
