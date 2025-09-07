import { LoggerService } from './LoggerService';

export class HealthCheckService
{
    #loggerService;
    #healthCheckInterval;
    #isRunning = false;

    constructor()
    {
        this.#loggerService = new LoggerService(this.constructor.name);
    }

    // Check health of a single service
    checkServiceHealth = async (serviceName, port) => 
    {
        const actuatorUrl = `http://localhost:${port}/actuator/health`;
        this.#loggerService.logInfo(`Checking health for ${serviceName} at ${actuatorUrl}`);
        
        try 
        {
            // Create an AbortController for timeout handling
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

            this.#loggerService.logInfo(`Making fetch request to: ${actuatorUrl}`);
            
            const response = await fetch(actuatorUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            this.#loggerService.logInfo(`Response received for ${serviceName}: ${response.status} ${response.statusText}`);
            this.#loggerService.logInfo(`Response headers: ${JSON.stringify([...response.headers.entries()])}`);

            if (response.ok) 
            {
                const healthData = await response.json();
                this.#loggerService.logInfo(`Health data received: ${JSON.stringify(healthData)}`);
                const isHealthy = healthData.status === 'UP';
                return {
                    isHealthy,
                    statusText: isHealthy ? 'Healthy' : 'Unhealthy',
                    lastChecked: new Date().toISOString(),
                    details: healthData
                };
            } 
            else 
            {
                this.#loggerService.logError(`HTTP Error ${response.status}: ${response.statusText}`);
                return {
                    isHealthy: false,
                    statusText: `HTTP ${response.status}`,
                    lastChecked: new Date().toISOString(),
                    details: null
                };
            }
        } 
        catch (error) 
        {
            this.#loggerService.logError(`Fetch error for ${serviceName}: ${error.name} - ${error.message}`);
            this.#loggerService.logError(`Error stack: ${error.stack}`);
            
            let errorMessage = 'Connection Failed';
            if (error.name === 'AbortError') 
            {
                errorMessage = 'Timeout';
            } 
            else if (error.message.includes('Failed to fetch')) 
            {
                errorMessage = 'Network Error - Failed to fetch';
            } 
            else 
            {
                errorMessage = error.message;
            }

            return {
                isHealthy: false,
                statusText: errorMessage,
                lastChecked: new Date().toISOString(),
                details: { error: errorMessage, errorType: error.name }
            };
        }
    }

    // Check health of all services
    checkAllServicesHealth = async (services) => 
    {
        const healthPromises = services.map(service => 
            this.checkServiceHealth(service.name, service.port)
                .then(healthData => ({
                    ...service,
                    ...healthData
                }))
        );

        try 
        {
            const results = await Promise.all(healthPromises);
            return results;
        } 
        catch (error) 
        {
            this.#loggerService.logError(`Failed to check all services health: ${error.message}`);
            return services.map(service => ({
                ...service,
                isHealthy: false,
                statusText: 'Check Failed',
                lastChecked: new Date().toISOString(),
                details: null
            }));
        }
    }

    // Start periodic health checks
    startPeriodicHealthChecks = (services, updateCallback, intervalMs = 30000) => 
    {
        if (this.#isRunning) 
        {
            this.#loggerService.logInfo('Health checks already running');
            return;
        }

        this.#isRunning = true;
        this.#loggerService.logInfo(`Starting periodic health checks every ${intervalMs}ms`);

        // Initial check
        this.checkAllServicesHealth(services).then(updateCallback);

        // Set up interval
        this.#healthCheckInterval = setInterval(async () => 
        {
            try 
            {
                const results = await this.checkAllServicesHealth(services);
                updateCallback(results);
            } 
            catch (error) 
            {
                this.#loggerService.logError(`Periodic health check failed: ${error.message}`);
            }
        }, intervalMs);
    }

    // Stop periodic health checks
    stopPeriodicHealthChecks = () => 
    {
        if (this.#healthCheckInterval) 
        {
            clearInterval(this.#healthCheckInterval);
            this.#healthCheckInterval = null;
            this.#isRunning = false;
            this.#loggerService.logInfo('Stopped periodic health checks');
        }
    }

    // Get current running status
    isRunning = () => this.#isRunning;
}
