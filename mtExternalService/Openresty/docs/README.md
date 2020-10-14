# API Gateway Server

## Goal

API Gateway Server exposes a set of interface that allows you to access mtrest/livy/launcher/mtlogin api reside in different sub clusters.

## Architecture

API Gateway Server is a Openresty service for MT that deliver client requests to different upstream
services, including mtrest, livy, launcher and mtlogin.

## Dependencies

To start a API Gateway Server service, the following services should be ready and correctly configured.

* MT Rest Server
* MT Apache Livy
* MT Launcher Server
* MT Login Server
* MT Yarn Resource Manager Server
* MT Spark Job History Server

## Build

Check your powershell version at least 4.0, then under powershell environment, run build.ps1 [dist_dir] in root directory.
The build.ps1 script will download dependent file from internet or use local dependent file in ./dep directory.
Then create a release version in dist_dir, if you diden't input a dist_dir parameter when run build.ps1, then ./dist will be used as default 
release direcotry.

## Configuration

API Gateway Server's configuration is located in conf sub direcotry, the file including:

* `nginx.conf`: Main configure file.
* `dns.conf`: Configure file for dns server.
* `api_main.conf`: Configure for environment variable and for main directive.
* `ssl`: Directory for certs file.
* `sites-enabled`: Site specific configure file.
* `api-lua`: Directory for api gateway specific lua script.


---

API Gateway Server configure the follow port:

* `admin portal`: The http port for the admin web portal and health check url. The default value is 8080.
* `mtrest server`: The https port for the mtrest server. The default value is 4431.
* `livy server`: The https port for the livy server. The default value is 4432.
* `launcher server`: The https port for the launcher server. The default value is 4433.
* `mtlogin server`: The https port for the mtlogin server. The default value is 4434.
* `rm server`: The https port for the yarn resource manager server. The default value is 4435.
* `shs server`: The https port for the spark job history server. The default value is 4437.

## Deployment

Run build.ps1 to create release version in .\dist directory.
Copy .\dist directory to where you want to run.
Run start.bat in servie root path.
Run nginx -s reload to reload configuration.


## Upgrading

You can modify build.ps1 to use a new dependent openresty version and other dependent module.
Then you can run build.ps1 to create a new release version.
API Gateway Server is a stateless service, so it could be upgraded without any extra operation.

## Service Metrics

TBD

## Service Monitoring

You can call every service's status url to check the backend services's health status.
eg.
* https://mt-api:4431/status   
* https://mt-api:4432/status   
* https://mt-api:4433/status   
* https://mt-api:4434/status
* https://mt-api:4435/status
* https://mt-api:4437/status

## High Availability

API Gateway Server is a stateless service, so it could be extends for high availability without any extra operation.

## Runtime Requirements


## API document

Read [API document](./APIGW_api.md) for the details of API Gateway API.


## FAQ


## Reference

* Goto [Openresty](https://openresty.org/en/) for Openresty
* Goto [Nginx](http://nginx.org/) for Nginx