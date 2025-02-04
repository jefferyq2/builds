import { promises as fs } from 'fs'
import { resolve } from 'path'
import { arch, platform } from 'process'

import type { InvocationMode } from './function.js'
import type { FunctionResult } from './utils/format_result.js'
import type { Route } from './utils/routes.js'

export interface TrafficRules {
  action: {
    type: string
    config: {
      rateLimitConfig: {
        algorithm: string
        windowSize: number
        windowLimit: number
      }
      aggregate: {
        keys: {
          type: string
        }[]
      }
      to?: string
    }
  }
}

interface ManifestFunction {
  buildData?: Record<string, unknown>
  invocationMode?: InvocationMode
  mainFile: string
  name: string
  path: string
  routes?: Route[]
  runtime: string
  runtimeVersion?: string
  schedule?: string
  displayName?: string
  bundler?: string
  generator?: string
  timeout?: number
  priority?: number
  trafficRules?: TrafficRules
}

export interface Manifest {
  functions: ManifestFunction[]
  system: {
    arch: string
    platform: string
  }
  timestamp: number
  version: number
}

const MANIFEST_VERSION = 1

export const createManifest = async ({ functions, path }: { functions: FunctionResult[]; path: string }) => {
  const formattedFunctions = functions.map((func) => formatFunctionForManifest(func))
  const payload: Manifest = {
    functions: formattedFunctions,
    system: { arch, platform },
    timestamp: Date.now(),
    version: MANIFEST_VERSION,
  }

  await fs.writeFile(path, JSON.stringify(payload))
}

const formatFunctionForManifest = ({
  bundler,
  displayName,
  generator,
  invocationMode,
  mainFile,
  name,
  path,
  priority,
  trafficRules,
  routes,
  runtime,
  runtimeVersion,
  runtimeAPIVersion,
  schedule,
  timeout,
}: FunctionResult): ManifestFunction => {
  const manifestFunction: ManifestFunction = {
    bundler,
    displayName,
    generator,
    timeout,
    invocationMode,
    buildData: { runtimeAPIVersion },
    mainFile,
    name,
    priority,
    trafficRules,
    runtimeVersion,
    path: resolve(path),
    runtime,
    schedule,
  }

  if (routes?.length !== 0) {
    manifestFunction.routes = routes
  }

  return manifestFunction
}
