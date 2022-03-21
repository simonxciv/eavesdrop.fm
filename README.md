<img src="https://eavesdrop.fm/list-music-solid.svg" align="right" width="150" />

# eavesdrop.fm

[![Netlify Status](https://api.netlify.com/api/v1/badges/79338f19-0931-4659-8f93-65a53c138f67/deploy-status)](https://app.netlify.com/sites/eavesdropfm/deploys)

> Submit your Plex music listening data to ListenBrainz

## What is it?

Born out of a desire to contribute my listening data to the ListenBrainz project, eavesdrop.fm is a web service that takes Plex webhook payloads and submits them to ListenBrainz via the ListenBrainz API.

## How do I use it?

Head to [eavesdrop.fm](https://eavesdrop.fm) and follow the step-by-step guide to get started.

## Developing

### Prerequisites

> This project uses [Volta](https://volta.sh/) to manage the required node/npm version. Check `package.json` for the current requirements.

### Installation

1. Clone this repository
2. Run `npm run dev` to start a development server

### Features

eavesdrop.fm is built with [SvelteKit](https://kit.svelte.dev/) and consists of two primary user-facing features:

1. A front-end to generate the unique webhook URL. It can be found in `src/routes/index.svelte`.
2. A webhook listener, implemented as a [SvelteKit endpoint](https://kit.svelte.dev/docs/routing#endpoints). It's found at `src/routes/index.ts`.
