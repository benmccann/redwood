import path from 'path'

import { getConfig, getConfigPath } from './config'
import { TargetEnum } from './config'

export interface NodePaths {
  db: string
  dbSchema: string
  src: string
  functions: string
  graphql: string
  lib: string
  services: string
}

export interface BrowserPaths {
  src: string
  routes: string
  pages: string
  components: string
  layouts: string
  config: string
}

export interface Paths {
  base: string
  workspaces: {
    [workspace: string]: NodePaths | BrowserPaths
  }
}

const mapNodePaths = (wsPath: string): NodePaths => {
  return {
    src: path.join(wsPath, 'src'),
    functions: path.join(wsPath, 'src/functions'),
    graphql: path.join(wsPath, 'src/graphql'),
    lib: path.join(wsPath, 'src/lib'),
    services: path.join(wsPath, 'src/services'),
    db: path.join(wsPath, 'prisma'),
    dbSchema: path.join(wsPath, 'prisma/schema.prisma'),
  }
}

const mapBrowserPaths = (wsPath: string): BrowserPaths => {
  return {
    src: path.join(wsPath, 'src'),
    routes: path.join(wsPath, 'src/Routes.js'),
    pages: path.join(wsPath, 'src/pages'),
    components: path.join(wsPath, 'src/components'),
    layouts: path.join(wsPath, 'src/layouts'),
    config: path.join(wsPath, 'src/config'),
  }
}

/**
 * Absolute paths for the directory structure of a Redwood project based
 * on the `redwood.toml` file.
 */
export const getPaths = (): Paths => {
  // The Redwood config file denotes the base directory of a Redwood project.
  const base = path.dirname(getConfigPath())
  const config = getConfig()
  // Redwood supports different targets (node, browser) for workspaces. They
  // have different directory structures, so we map the workspaces based
  // on the "target" parameter.
  const workspaces = Object.keys(config).reduce((acc, key) => {
    const workspace = config[key]
    let paths
    switch (workspace.target) {
      case TargetEnum.NODE:
        paths = mapNodePaths(path.join(base, workspace.path))
        break
      case TargetEnum.BROWSER:
        paths = mapBrowserPaths(path.join(base, workspace.path))
        break
      default:
        throw new Error(
          `Woah there! "${key}" has a target that is is not currently supported:\n${JSON.stringify(
            workspace,
            undefined,
            2
          )}`
        )
    }
    return {
      [key]: paths,
      ...acc,
    }
  }, {})

  return {
    base,
    workspaces,
  }
}

export const getWorkspacePaths = (
  workspaceName: string
): BrowserPaths | NodePaths => {
  return getPaths().workspaces[workspaceName]
}
