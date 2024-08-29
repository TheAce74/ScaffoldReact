#!/usr/bin/env node

import prompts from "prompts";
import fs from "fs-extra";
import path from "path";
import { Command } from "commander";
import { spawn } from "child_process";
import JSON5 from "json5";

const program = new Command();

program
  .option("--tailwind", "Include Tailwind CSS")
  .option("--react-router", "Include React Router")
  .option("--mantine", "Include Mantine UI Library")
  .option("--react-toastify", "Include React Toastify")
  .option("--axios", "Include Axios")
  .option("--zustand", "Include Zustand")
  .option("--tanstack-query", "Include TanStack Query")
  .option("--react-icons", "Include React Icons")
  .option("--all", "Include All")
  .parse(process.argv);

const options = program.opts();

// Function to execute shell commands
async function runCommand(command: string, args: string[], cwd?: string) {
  return new Promise((resolve, reject) => {
    const subprocess = spawn(command, args, {
      stdio: "inherit",
      cwd,
      shell: true,
    });

    subprocess.on("close", (code) => {
      if (code === 0) {
        resolve(undefined);
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    subprocess.on("error", (error) => {
      reject(error);
    });
  });
}

// Function to create the Vite project
async function createViteProject(projectName: string) {
  await runCommand("pnpm", [
    "create",
    "vite",
    projectName,
    "--template",
    "react-ts",
  ]);
}

// Function to install additional packages
async function installPackages(
  packages: {
    name: string;
    devOnly: boolean;
  }[],
  projectPath: string
) {
  const prod = packages.filter((pkg) => !pkg.devOnly);
  const dev = packages.filter((pkg) => pkg.devOnly);
  if (prod.length > 0) {
    await runCommand(
      "pnpm",
      ["install", ...prod.map((item) => item.name)],
      projectPath
    );
  }
  if (dev.length > 0) {
    await runCommand(
      "pnpm",
      ["install --save-dev", ...dev.map((item) => item.name)],
      projectPath
    );
  }
}

// Function to add Tailwind CSS and related configurations
async function addTailwindConfig(projectPath: string) {
  await runCommand("npx", ["tailwindcss", "init", "-p"], projectPath);

  // Rename tailwind.config.js to tailwind.config.ts
  const jsConfigPath = path.join(projectPath, "tailwind.config.js");
  const tsConfigPath = path.join(projectPath, "tailwind.config.ts");

  await fs.rename(jsConfigPath, tsConfigPath);

  // Update the Tailwind configuration file to TypeScript
  const tailwindConfig = `import type { Config } from "tailwindcss";
  const config: Config = {
    content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
      extend: {},
    },
    plugins: [],
  };
  
  export default config;`;

  await fs.writeFile(tsConfigPath, tailwindConfig);

  // Add Tailwind CSS to the main index.css file
  const indexCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer utilities {
    .flex-starter {
        @apply flex items-center justify-between;
    }

    .trans-all {
        @apply transition-all duration-300;
    }
}`;
  await fs.writeFile(path.join(projectPath, "src", "index.css"), indexCss);

  const prettierContent = `{
  "plugins": ["prettier-plugin-tailwindcss"],
  "tailwindFunctions": ["cva", "clsx", "cn"]
}
`;

  await fs.writeFile(path.join(projectPath, ".prettierrc"), prettierContent);
}

// Function to add React Router configuration
async function addReactRouterConfig(projectPath: string) {
  const routerFileContent = `import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { ScrollToTop } from "@/helpers/ScrollToTop";
import Error from "@/components/ui/Error";

const router = createBrowserRouter([
  {
    element: (
        <div className="mx-auto min-h-screen max-w-[120em] shadow">
            <Outlet />
            <ScrollToTop />
        </div>
    ),
    errorElement: <Error />,
    children: [
      {
        path: "/",
        element: <div>Home</div>,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;`;

  await fs.writeFile(
    path.join(projectPath, "src", "App.tsx"),
    routerFileContent
  );

  const scrollToTopContent = `import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return <></>;
};

export { ScrollToTop };
`;

  const helpersPath = path.join(projectPath, "src", "helpers");

  // Create the helpers directory if it doesn't exist
  await fs.mkdir(helpersPath, { recursive: true });

  // Write the ScrollToTop.tsx file
  await fs.writeFile(
    path.join(helpersPath, "ScrollToTop.tsx"),
    scrollToTopContent
  );

  const errorContent = `import { Link } from "react-router-dom";
import { FaAngleRight } from "react-icons/fa";
import Button from "@/components/ui/Button";

export default function Error() {
  return (
    <section className="grid h-screen place-content-center place-items-center gap-5 px-4 text-center">
      <h3 className="text-lg font-bold lg:text-xl">
        Sorry! the page you are looking for isn&apos;t available
      </h3>
      <p className="mb-3 text-neutral-500">
        You can go back to our homepage to explore lots of our services
      </p>
      <Link to="/">
        <Button>
          <span>Go back to homepage</span>
          <FaAngleRight />
        </Button>
      </Link>
    </section>
  );
}
`;

  const uiComponentsPath = path.join(projectPath, "src", "components", "ui");

  // Create the 'ui' directory if it doesn't exist
  await fs.mkdir(uiComponentsPath, { recursive: true });

  // Write the Error.tsx file
  await fs.writeFile(path.join(uiComponentsPath, "Error.tsx"), errorContent);

  const buttonContent = `import { ButtonVariants } from "@/lib/types";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariants;
};

export default function Button({
  children,
  variant,
  type,
  className,
  ...otherProps
}: ButtonProps) {
  return (
    <button
      type={type ?? "button"}
      {...otherProps}
      className={cn(buttonVariants({ variant }), className)}
    >
      {children}
    </button>
  );
}

const buttonVariants = cva(
  "trans-all flex min-w-max items-center justify-center gap-2 rounded-sm border border-current px-6 py-3 text-sm text-neutral-900 hover:scale-95 focus-visible:scale-95 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60",
  {
    variants: {
      variant: {
        primary: "",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);
`;

  await fs.writeFile(path.join(uiComponentsPath, "Button.tsx"), buttonContent);

  const typesContent = `export type ButtonVariants = "primary";`;

  const libPath = path.join(projectPath, "src", "lib");

  // Create the 'lib' directory if it doesn't exist
  await fs.mkdir(libPath, { recursive: true });

  // Write the types.ts file
  await fs.writeFile(path.join(libPath, "types.ts"), typesContent);

  const utilsContent = `import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...classes: ClassValue[]): string => {
  return twMerge(clsx(classes));
};

export const getErrorMessage = (error: unknown): string => {
  let message: string;

  if (error instanceof Error) {
    message = error.message;
  } else if (error && typeof error === "object" && "message" in error) {
    message = String(error.message);
  } else if (typeof error === "string") {
    message = error;
  } else {
    message = "Something went wrong";
  }

  return message;
};

export const getInitials = (value: string): string => {
  const arr = value.split(" ");
  return arr.length === 1 ? arr[0][0] : arr[0][0] + arr[1][0];
};`;

  await fs.writeFile(path.join(libPath, "utils.ts"), utilsContent);
}

// Function to set up Vite and TypeScript aliases
async function setupAliases(projectPath: string) {
  const viteConfigPath = path.join(projectPath, "vite.config.ts");
  const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});`;

  await fs.writeFile(viteConfigPath, viteConfig);

  const tsconfigPath = path.join(projectPath, "tsconfig.app.json");
  const tsconfig = await fs.readFile(tsconfigPath, "utf8");
  const tsconfigJson = JSON5.parse(tsconfig);

  tsconfigJson.compilerOptions.baseUrl = ".";
  tsconfigJson.compilerOptions.paths = {
    "@/*": ["src/*"],
  };

  await fs.writeFile(tsconfigPath, JSON.stringify(tsconfigJson, null, 2));
}

// Main function to create the Vite app with optional configurations
async function main() {
  const { projectName } = await prompts({
    type: "text",
    name: "projectName",
    message: "What is the project name?",
    initial: "my-vite-app",
  });

  const projectPath = path.join(process.cwd(), projectName);

  await createViteProject(projectName);

  const packages: {
    name: string;
    devOnly: boolean;
  }[] = [];

  if (options.all) {
    packages.push(
      {
        name: "tailwindcss",
        devOnly: true,
      },
      {
        name: "postcss",
        devOnly: true,
      },
      {
        name: "autoprefixer",
        devOnly: true,
      },
      {
        name: "class-variance-authority",
        devOnly: false,
      },
      {
        name: "clsx",
        devOnly: false,
      },
      {
        name: "tailwind-merge",
        devOnly: false,
      },
      {
        name: "prettier",
        devOnly: true,
      },
      {
        name: "prettier-plugin-tailwindcss",
        devOnly: true,
      },
      {
        name: "@types/node",
        devOnly: true,
      },
      {
        name: "react-router-dom",
        devOnly: false,
      },
      {
        name: "@mantine/core",
        devOnly: false,
      },
      {
        name: "@mantine/hooks",
        devOnly: false,
      },
      {
        name: "react-toastify",
        devOnly: false,
      },
      {
        name: "axios",
        devOnly: false,
      },
      {
        name: "zustand",
        devOnly: false,
      },
      {
        name: "@tanstack/react-query",
        devOnly: false,
      },
      {
        name: "react-icons",
        devOnly: false,
      }
    );
  } else {
    if (options.tailwind || (await ask("Do you want to add Tailwind CSS?"))) {
      packages.push(
        {
          name: "tailwindcss",
          devOnly: true,
        },
        {
          name: "postcss",
          devOnly: true,
        },
        {
          name: "autoprefixer",
          devOnly: true,
        },
        {
          name: "class-variance-authority",
          devOnly: false,
        },
        {
          name: "clsx",
          devOnly: false,
        },
        {
          name: "tailwind-merge",
          devOnly: false,
        },
        {
          name: "prettier",
          devOnly: true,
        },
        {
          name: "prettier-plugin-tailwindcss",
          devOnly: true,
        },
        {
          name: "@types/node",
          devOnly: true,
        }
      );
    }
    if (
      options.reactRouter ||
      (await ask("Do you want to add React Router?"))
    ) {
      packages.push({
        name: "react-router-dom",
        devOnly: false,
      });
    }
    if (
      options.mantine ||
      (await ask("Do you want to add Mantine UI Library?"))
    ) {
      packages.push(
        {
          name: "@mantine/core",
          devOnly: false,
        },
        {
          name: "@mantine/hooks",
          devOnly: false,
        }
      );
    }
    if (
      options.reactToastify ||
      (await ask("Do you want to add React Toastify?"))
    ) {
      packages.push({
        name: "react-toastify",
        devOnly: false,
      });
    }
    if (options.axios || (await ask("Do you want to add Axios?"))) {
      packages.push({
        name: "axios",
        devOnly: false,
      });
    }
    if (options.zustand || (await ask("Do you want to add Zustand?"))) {
      packages.push({
        name: "zustand",
        devOnly: false,
      });
    }
    if (
      options.tanstackQuery ||
      (await ask("Do you want to add TanStack Query?"))
    ) {
      packages.push({
        name: "@tanstack/react-query",
        devOnly: false,
      });
    }
    if (options.reactIcons || (await ask("Do you want to add React Icons?"))) {
      packages.push({
        name: "react-icons",
        devOnly: false,
      });
    }
  }

  if (packages.length > 0) {
    await installPackages(packages, projectPath);
  }

  if (
    options.tailwind ||
    packages.find((item) => item.name === "tailwindcss")
  ) {
    await addTailwindConfig(projectPath);
  }
  if (
    options.reactRouter ||
    packages.find((item) => item.name === "react-router-dom")
  ) {
    await addReactRouterConfig(projectPath);
  }

  await setupAliases(projectPath);

  console.log("Project setup complete!");
}

async function ask(message: string): Promise<boolean> {
  const response = await prompts({
    type: "toggle",
    name: "value",
    message: message,
    initial: true,
    active: "yes",
    inactive: "no",
  });

  return response.value;
}

main().catch(console.error);
