param location string = resourceGroup().location
param projectName string = 'babymonitor'
param environment string = 'dev'
param tenantId string = '11dfdbbd-4a23-4cb7-b4c1-08aaf72dc2fb'
param userObjectId string = 'f4a0434c-b4c3-469f-97aa-9fabdb7da319'

var uniqueSuffix = uniqueString(resourceGroup().id)
var staticWebAppName = '${projectName}-web-${environment}-${uniqueSuffix}'
var cosmosAccountName = '${projectName}-cosmos-${environment}-${uniqueSuffix}'
var storageName = 'bmst${substring(uniqueSuffix, 0, 13)}'
var keyVaultName = 'bmkv${substring(uniqueSuffix, 0, 13)}'

resource cosmosAccount 'Microsoft.DocumentDB/databaseAccounts@2023-04-15' = {
  name: cosmosAccountName
  location: location
  kind: 'GlobalDocumentDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'
    }
    locations: [
      {
        locationName: location
        failoverPriority: 0
        isZoneRedundant: false
      }
    ]
    enableFreeTier: true
    backupPolicy: {
      type: 'Periodic'
      periodicModeProperties: {
        backupIntervalInMinutes: 240
        backupRetentionIntervalInHours: 8
        backupStorageRedundancy: 'Local'
      }
    }
    isVirtualNetworkFilterEnabled: false
    minimalTlsVersion: 'Tls12'
    enableMultipleWriteLocations: false
    disableLocalAuth: false
  }
  tags: {
    defaultExperience: 'Core (SQL)'
    project: projectName
    environment: environment
  }
}

resource cosmosDatabase 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2023-04-15' = {
  parent: cosmosAccount
  name: 'BabyMonitorDB'
  properties: {
    resource: {
      id: 'BabyMonitorDB'
    }
    options: {
      throughput: 400
    }
  }
}

resource cosmosContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2023-04-15' = {
  parent: cosmosDatabase
  name: 'NoiseData'
  properties: {
    resource: {
      id: 'NoiseData'
      partitionKey: {
        paths: [
          '/deviceId'
        ]
        kind: 'Hash'
      }
      indexingPolicy: {
        automatic: true
        indexingMode: 'consistent'
        includedPaths: [
          {
            path: '/*'
          }
        ]
        excludedPaths: [
          {
            path: '/"_etag"/?'
          }
        ]
      }
    }
  }
}

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
    allowSharedKeyAccess: true
    publicNetworkAccess: 'Enabled'
    encryption: {
      keySource: 'Microsoft.Storage'
      services: {
        blob: {
          enabled: true
        }
        file: {
          enabled: true
        }
      }
    }
  }
  tags: {
    project: projectName
    environment: environment
  }
}

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: tenantId
    enableRbacAuthorization: false
    accessPolicies: [
      {
        tenantId: tenantId
        objectId: userObjectId
        permissions: {
          keys: ['all']
          secrets: ['all']
          certificates: ['all']
        }
      }
    ]
    enabledForDeployment: false
    enabledForDiskEncryption: false
    enabledForTemplateDeployment: true
    enableSoftDelete: true
    softDeleteRetentionInDays: 7
    publicNetworkAccess: 'Enabled'
  }
  tags: {
    project: projectName
    environment: environment
  }
}

// Store Cosmos DB credentials in Key Vault
resource cosmosDbEndpointSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'CosmosDbEndpoint'
  properties: {
    value: cosmosAccount.properties.documentEndpoint
  }
}

resource cosmosDbKeySecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'CosmosDbKey'
  properties: {
    value: cosmosAccount.listKeys().primaryMasterKey
  }
}

resource storageConnectionStringSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'StorageConnectionString'
  properties: {
    value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};EndpointSuffix=${az.environment().suffixes.storage};AccountKey=${storageAccount.listKeys().keys[0].value}'
  }
}

// Function App and Hosting Plan removed - not supported in this subscription
// You'll need to create these manually or use a different deployment method

resource staticWebApp 'Microsoft.Web/staticSites@2022-09-01' = {
  name: staticWebAppName
  location: location
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    buildProperties: {
      skipGithubActionWorkflowGeneration: true
    }
  }
  tags: {
    project: projectName
    environment: environment
  }
}

output staticWebAppUrl string = 'https://${staticWebApp.properties.defaultHostname}'
output staticWebAppName string = staticWebApp.name
output cosmosDbEndpoint string = cosmosAccount.properties.documentEndpoint
output cosmosDbAccountName string = cosmosAccount.name
output storageAccountName string = storageAccount.name
output keyVaultName string = keyVault.name
output keyVaultUri string = keyVault.properties.vaultUri
output resourceGroupName string = resourceGroup().name

