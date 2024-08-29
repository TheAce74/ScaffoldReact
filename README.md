# ScaffoldReact Setup Guide

This script allows you to quickly scaffold a new Vite + React + TypeScript project with various optional packages and configurations.

## Making the Script Executable

To make the script executable from anywhere on your PC, follow these steps (you only need to do this once):

1. **Compile TypeScript**:
   Run the TypeScript compiler to generate JavaScript output:

   ```bash
   npx tsc
   ```

2. **Make the Script Executable**:
   Change the permissions of the script to make it executable:

   ```bash
   chmod +x dist/index.js
   ```

3. **Link the Script Globally**:
   Link the script globally so it can be run from any location:
   ```bash
   npm link
   ```

## Project Setup

Once you have linked the script globally, you can run it from anywhere on your computer using the command:

```bash
create-vite-app [options]
```

For example, to create a new project with Tailwind CSS and React Router, you would run:

```bash
create-vite-app --tailwind --react-router
```

That's it! You now have a streamlined way to set up new Vite + React + TypeScript projects with customizable configurations.

## Options

You can customize the setup with the following options:

- `--tailwind`: Include Tailwind CSS and related utilities.
- `--react-router`: Include React Router for routing.
- `--mantine`: Include Mantine UI library.
- `--react-toastify`: Include React-Toastify for notifications.
- `--axios`: Include Axios for HTTP requests.
- `--zustand`: Include Zustand for state management.
- `--tanstack-query`: Include TanStack Query for data fetching and caching.
- `--react-icons`: Include React Icons for a plethora of icons.
- `--all`: Include all packages listed above.
