import express from 'express';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

/** * Dynamically imports a JavaScript file and executes its default export or named 'handler' function.
 * This function is used to handle requests by importing the appropriate handler based on the request method.
 * @param {string} jsFilePath - The path to the JavaScript file to import.
 * @returns {Function} - A function that takes a request and response object, executing the imported handler.
 */
export const useDynamicHandler = jsFilePath => {
  return async (req, res) => {
    try {
      const fileUrl = pathToFileURL(jsFilePath).href;
      const handler = await import(`${fileUrl}?t=${Date.now()}`);

      if (typeof handler.default === 'function') {
        return handler.default(req, res);
      } else if (typeof handler.handler === 'function') {
        return handler.handler(req, res);
      } else {
        console.error(
          `Handler at ${jsFilePath} does not export a default function or named 'handler' function`,
        );
        return res.status(500).json({ error: 'Invalid handler export' });
      }
    } catch (error) {
      console.error(`Error importing handler ${jsFilePath}:`, error);
      return res.status(500).json({ error: 'Handler execution error' });
    }
  };
};

/** * Finds a matching directory for the given segment in the current path.
 * It checks for exact matches and also for parameterized directories
 * (e.g., __paramName__).
 * @param {string} currentPath - The current directory path to search in.
 * @param {string} segment - The segment to match against directory names.
 * @returns {Object|null} - An object with the path and parameter details if a match is found,
 * or null if no match is found.
 */
export const findMatchingDir = (currentPath, segment) => {
  if (!fs.existsSync(currentPath)) {
    return null;
  }

  const entries = fs.readdirSync(currentPath, { withFileTypes: true });
  const directories = entries
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);

  if (directories.includes(segment)) {
    return {
      path: path.join(currentPath, segment),
      paramName: null,
      paramValue: null,
    };
  }

  const paramDir = directories.find(
    dir => dir.startsWith('__') && dir.endsWith('__'),
  );
  if (paramDir) {
    const paramName = paramDir.slice(2, -2);
    return {
      path: path.join(currentPath, paramDir),
      paramName: paramName,
      paramValue: segment,
    };
  }

  return null;
};

/** * Configures mock routes for the provided directory path.
 * It dynamically loads handlers based on the request method and path.
 * * @param {string} directoryPath - The base directory where mock handlers are stored.
 * @returns {express.Router} - An Express router with configured mock routes.
 */
export const configureMockRoutes = directoryPath => {
  const router = express.Router();

  router.use(async (req, res) => {
    const method = req.method.toUpperCase();
    const rawPath = req.params && req.params[0] !== undefined ? req.params[0] : req.path || '';
    const requestPath = rawPath && rawPath.startsWith('/') ? rawPath.slice(1) : rawPath;

    const pathSegments = requestPath
      .split('/')
      .filter(segment => segment.length > 0);

    let targetDir = directoryPath;
    const extractedParams = {};

    let currentDir = directoryPath;

    for (const segment of pathSegments) {
      const match = findMatchingDir(currentDir, segment);
      if (!match) return res.status(404).json({ error: 'Not Found' });

      currentDir = match.path;
      if (match.paramName) {
        extractedParams[match.paramName] = match.paramValue;
      }
    }

    targetDir = currentDir;

    Object.assign(req.params, extractedParams);

    const jsFilePath = path.join(targetDir, `${method}.js`);
    const wildcardJsFilePath = path.join(targetDir, 'ANY.js');
    if (fs.existsSync(jsFilePath)) {
      return await useDynamicHandler(jsFilePath)(req, res);
    } else if (fs.existsSync(wildcardJsFilePath)) {
      return await useDynamicHandler(wildcardJsFilePath)(req, res);
    }

    const jsonFilePath = path.join(targetDir, `${method}.json`);
    const wildcardJsonFilePath = path.join(targetDir, 'ANY.json');

    if (fs.existsSync(jsonFilePath)) {
      return res.sendFile(path.resolve(jsonFilePath));
    } else if (fs.existsSync(wildcardJsonFilePath)) {
      return res.sendFile(path.resolve(wildcardJsonFilePath));
    }

    return res.status(404).json({ error: 'Not Found' });
  });

  return router;
};
