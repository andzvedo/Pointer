This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## About This Project

This application serves as a tool to extract, view, and inspect Figma file data. Users can input a Figma File URL to fetch design nodes from the Figma API and see a rendered preview of these nodes. It allows for a closer look at the structure and properties of Figma designs directly within a web interface.

### Key Features:

*   **Figma URL Input:** Users can paste a Figma file URL to initiate the data extraction process.
*   **Visual Preview:** Renders a visual representation of top-level frames and components from the specified Figma file.
*   **Node Properties Display:** Shows detailed properties of the primary selected/viewed node, such as its type, dimensions (width, height), and other relevant metadata.
*   **Raw JSON Data:** Provides a view of the raw JSON data for the selected node, with a convenient copy-to-clipboard feature for developers.
*   **Zoom Functionality:** Allows users to zoom in and out of the visual preview for a more detailed inspection.

### Main Technologies Used:

*   **Next.js:** A React framework for building server-side rendered and static web applications.
*   **TypeScript:** A superset of JavaScript that adds static typing.
*   **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
*   **Shadcn UI:** A collection of re-usable UI components.
*   **Figma API:** Used to fetch file data, accessed via the `figma-api` library in the backend.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
