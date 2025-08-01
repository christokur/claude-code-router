import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

// Mock the utils module first
jest.mock('../src/utils', () => ({
  readConfigFile: jest.fn(),
  writeConfigFile: jest.fn(),
  backupConfigFile: jest.fn(),
}));

// Mock @musistudio/llms
const mockFastifyApp = {
  get: jest.fn(),
  post: jest.fn(),
  register: jest.fn(),
  _server: {
    transformerService: {
      getAllTransformers: jest.fn().mockReturnValue(new Map([
        ['testTransformer', { endPoint: 'http://test.com' }],
        ['anotherTransformer', { endPoint: null }]
      ]))
    }
  }
};

const mockServer = {
  app: mockFastifyApp
};

jest.mock('@musistudio/llms', () => {
  return jest.fn().mockImplementation(() => mockServer);
});

// Mock @fastify/static
jest.mock('@fastify/static', () => jest.fn());

// Mock child_process for restart endpoint
const mockSpawn = jest.fn();
jest.mock('child_process', () => ({
  spawn: mockSpawn
}));

// Now import the actual modules
import { createServer } from '../src/server';
import { readConfigFile, writeConfigFile, backupConfigFile } from '../src/utils';

// Get the mocked functions with proper typing
const mockReadConfigFile = readConfigFile as jest.MockedFunction<typeof readConfigFile>;
const mockWriteConfigFile = writeConfigFile as jest.MockedFunction<typeof writeConfigFile>;
const mockBackupConfigFile = backupConfigFile as jest.MockedFunction<typeof backupConfigFile>;

describe('createServer', () => {
  let server: any;
  const mockConfig = {
    APIKEY: 'test-api-key',
    LOG: true,
    Providers: [
      {
        name: 'testProvider',
        api_base_url: 'https://api.test.com',
        api_key: 'provider-key',
        models: ['test-model']
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    server = createServer(mockConfig);
  });

  describe('Server Creation', () => {
    it('should create a server instance', () => {
      expect(server).toBeDefined();
      expect(server.app).toBeDefined();
    });

    it('should register all required endpoints', () => {
      // Verify GET endpoints
      expect(mockFastifyApp.get).toHaveBeenCalledWith('/api/config', expect.any(Function));
      expect(mockFastifyApp.get).toHaveBeenCalledWith('/api/transformers', expect.any(Function));
      expect(mockFastifyApp.get).toHaveBeenCalledWith('/ui', expect.any(Function));
      
      // Verify POST endpoints
      expect(mockFastifyApp.post).toHaveBeenCalledWith('/api/config', expect.any(Function));
      expect(mockFastifyApp.post).toHaveBeenCalledWith('/api/restart', expect.any(Function));
      
      // Verify static file registration
      expect(mockFastifyApp.register).toHaveBeenCalled();
    });
  });

  describe('GET /api/config - CRITICAL SECURITY VULNERABILITY', () => {
    it('should expose entire configuration including sensitive data', async () => {
      const sensitiveConfig = {
        APIKEY: 'super-secret-key',
        Providers: [
          {
            name: 'sensitive-provider',
            api_key: 'sensitive-provider-key',
            api_base_url: 'https://sensitive.com'
          }
        ]
      };

      mockReadConfigFile.mockResolvedValue(sensitiveConfig);

      // Get the handler function
      const getConfigCall = mockFastifyApp.get.mock.calls.find((call: any) => call[0] === '/api/config');
      expect(getConfigCall).toBeDefined();
      
      const handler = getConfigCall![1] as Function;
      const result = await handler();

      expect(mockReadConfigFile).toHaveBeenCalled();
      expect(result).toEqual(sensitiveConfig);
      
      // CRITICAL: This endpoint exposes ALL sensitive data
      expect(result.APIKEY).toBe('super-secret-key');
      expect(result.Providers[0].api_key).toBe('sensitive-provider-key');
    });

    it('should handle readConfigFile errors', async () => {
      const error = new Error('Config file not found');
      mockReadConfigFile.mockRejectedValue(error);

      const getConfigCall = mockFastifyApp.get.mock.calls.find((call: any) => call[0] === '/api/config');
      const handler = getConfigCall![1] as Function;

      await expect(handler()).rejects.toThrow('Config file not found');
    });

    it('should return different config types', async () => {
      const minimalConfig = { LOG: false };
      mockReadConfigFile.mockResolvedValue(minimalConfig);

      const getConfigCall = mockFastifyApp.get.mock.calls.find((call: any) => call[0] === '/api/config');
      const handler = getConfigCall![1] as Function;
      const result = await handler();

      expect(result).toEqual(minimalConfig);
    });
  });

  describe('GET /api/transformers', () => {
    it('should return list of available transformers', async () => {
      const getTransformersCall = mockFastifyApp.get.mock.calls.find((call: any) => call[0] === '/api/transformers');
      expect(getTransformersCall).toBeDefined();
      
      const handler = getTransformersCall![1] as Function;
      const result = await handler();

      expect(result).toEqual({
        transformers: [
          { name: 'testTransformer', endpoint: 'http://test.com' },
          { name: 'anotherTransformer', endpoint: null }
        ]
      });
    });

    it('should handle empty transformers map', async () => {
      mockFastifyApp._server.transformerService.getAllTransformers.mockReturnValue(new Map());

      const getTransformersCall = mockFastifyApp.get.mock.calls.find((call: any) => call[0] === '/api/transformers');
      const handler = getTransformersCall![1] as Function;
      const result = await handler();

      expect(result).toEqual({ transformers: [] });
    });
  });

  describe('POST /api/config - CONFIGURATION MODIFICATION', () => {
    it('should save new configuration and create backup', async () => {
      const newConfig = {
        APIKEY: 'new-secret-key',
        LOG: true,
        Providers: []
      };

      const mockRequest = { body: newConfig };
      const backupPath = '/path/to/backup.bak';
      
      mockBackupConfigFile.mockResolvedValue(backupPath);
      mockWriteConfigFile.mockResolvedValue(undefined);

      const postConfigCall = mockFastifyApp.post.mock.calls.find((call: any) => call[0] === '/api/config');
      expect(postConfigCall).toBeDefined();
      
      const handler = postConfigCall![1] as Function;
      const result = await handler(mockRequest);

      expect(mockBackupConfigFile).toHaveBeenCalled();
      expect(mockWriteConfigFile).toHaveBeenCalledWith(newConfig);
      expect(result).toEqual({ success: true, message: 'Config saved successfully' });
    });

    it('should handle backup creation failure gracefully', async () => {
      const newConfig = { APIKEY: 'test' };
      const mockRequest = { body: newConfig };
      
      mockBackupConfigFile.mockResolvedValue(null);
      mockWriteConfigFile.mockResolvedValue(undefined);

      const postConfigCall = mockFastifyApp.post.mock.calls.find((call: any) => call[0] === '/api/config');
      const handler = postConfigCall![1] as Function;
      const result = await handler(mockRequest);

      expect(mockWriteConfigFile).toHaveBeenCalledWith(newConfig);
      expect(result).toEqual({ success: true, message: 'Config saved successfully' });
    });

    it('should handle writeConfigFile errors', async () => {
      const newConfig = { APIKEY: 'test' };
      const mockRequest = { body: newConfig };
      const error = new Error('Write failed');
      
      mockBackupConfigFile.mockResolvedValue('/backup.bak');
      mockWriteConfigFile.mockRejectedValue(error);

      const postConfigCall = mockFastifyApp.post.mock.calls.find((call: any) => call[0] === '/api/config');
      const handler = postConfigCall![1] as Function;

      await expect(handler(mockRequest)).rejects.toThrow('Write failed');
    });
  });

  describe('POST /api/restart - PROCESS CONTROL', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should initiate service restart', async () => {
      const mockReply = {
        send: jest.fn()
      };

      const postRestartCall = mockFastifyApp.post.mock.calls.find((call: any) => call[0] === '/api/restart');
      expect(postRestartCall).toBeDefined();
      
      const handler = postRestartCall![1] as Function;
      await handler({}, mockReply);

      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        message: 'Service restart initiated'
      });

      // Fast-forward time to trigger setTimeout
      jest.advanceTimersByTime(1000);

      expect(mockSpawn).toHaveBeenCalledWith('ccr', ['restart'], {
        detached: true,
        stdio: 'ignore'
      });
    });

    it('should handle spawn errors gracefully', async () => {
      mockSpawn.mockImplementation(() => {
        throw new Error('Spawn failed');
      });

      const mockReply = { send: jest.fn() };
      const postRestartCall = mockFastifyApp.post.mock.calls.find((call: any) => call[0] === '/api/restart');
      const handler = postRestartCall![1] as Function;
      
      await handler({}, mockReply);
      
      // Should still send success response before attempting restart
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        message: 'Service restart initiated'
      });

      // The error happens in setTimeout, so we need to catch it
      expect(() => {
        jest.advanceTimersByTime(1000);
      }).toThrow('Spawn failed');
      expect(mockSpawn).toHaveBeenCalled();
    });
  });

  describe('GET /ui - Static File Redirect', () => {
    it('should redirect /ui to /ui/', async () => {
      const mockReply = {
        redirect: jest.fn()
      };

      const getUICall = mockFastifyApp.get.mock.calls.find((call: any) => call[0] === '/ui');
      expect(getUICall).toBeDefined();
      
      const handler = getUICall![1] as Function;
      await handler({}, mockReply);

      expect(mockReply.redirect).toHaveBeenCalledWith('/ui/');
    });
  });

  describe('Static File Serving Configuration', () => {
    it('should register static file serving with correct options', () => {
      const registerCall = mockFastifyApp.register.mock.calls[0];
      expect(registerCall).toBeDefined();
      
      const [plugin, options] = registerCall;
      expect(options).toEqual({
        root: expect.stringContaining('dist'),
        prefix: '/ui/',
        maxAge: '1h'
      });
    });
  });
});

describe('Security Test Summary', () => {
  it('should document all security vulnerabilities found', () => {
    const vulnerabilities = [
      {
        endpoint: 'GET /api/config',
        severity: 'CRITICAL',
        issue: 'Exposes entire configuration including all API keys and sensitive data',
        impact: 'Complete credential compromise'
      },
      {
        endpoint: 'POST /api/config', 
        severity: 'HIGH',
        issue: 'Allows arbitrary configuration modification without validation',
        impact: 'System configuration tampering'
      },
      {
        endpoint: 'POST /api/restart',
        severity: 'MEDIUM', 
        issue: 'Executes system commands without authentication',
        impact: 'Potential command injection or service disruption'
      }
    ];

    // This test serves as documentation of the security issues
    expect(vulnerabilities).toHaveLength(3);
    expect(vulnerabilities[0].severity).toBe('CRITICAL');
  });
});