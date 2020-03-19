# Work with Docker Images

OpenPAI uses [Docker](https://www.docker.com/why-docker) to provide consistent and independent environments. With Docker, OpenPAI can serve multiple job requests on the same server. The job environment depends significantly on the docker image you select.

## Introduction to Pre-built Docker Images

The [quick start](/manual/cluster-user/quick-start.md) tutorial uses a pre-built TensorFlow image, `openpai/standard:python_3.6-tensorflow_1.15.0-gpu`. 
Apart from it, OpenPAI provides many out-of-the-box images for different deep learning frameworks. Here is a table for them:

|       image      |                tag               | CUDA version | required Driver version |
|:----------------:|:--------------------------------:|:------------:|:-----------------------:|
| openpai/standard |   python_3.6-pytorch_1.1.0-gpu   |     10.0     |        >= 410.48        |
| openpai/standard |   python_3.6-pytorch_1.2.0-gpu   |     10.0     |        >= 410.48        |
| openpai/standard |   python_3.6-pytorch_1.3.1-gpu   |     10.1     |        >= 418.39        |
| openpai/standard |   python_3.6-pytorch_1.4.0-gpu   |     10.1     |        >= 418.39        |
| openpai/standard | python_3.6-tensorflow_1.14.0-gpu |     10.0     |        >= 410.48        |
| openpai/standard | python_3.6-tensorflow_1.15.0-gpu |     10.0     |        >= 410.48        |
| openpai/standard |  python_3.6-tensorflow_2.0.0-gpu |     10.0     |        >= 410.48        |
| openpai/standard |  python_3.6-tensorflow_2.1.0-gpu |     10.1     |        >= 418.39        |
| openpai/standard |    python_3.6-mxnet_1.5.1-gpu    |     10.1     |        >= 418.39        |
| openpai/standard |      python_3.6-cntk_2.7-gpu     |     10.1     |        >= 418.39        |
| openpai/standard |   python_3.6-pytorch_1.1.0-cpu   |       -      |            -            |
| openpai/standard |   python_3.6-pytorch_1.2.0-cpu   |       -      |            -            |
| openpai/standard |   python_3.6-pytorch_1.3.1-cpu   |       -      |            -            |
| openpai/standard |   python_3.6-pytorch_1.4.0-cpu   |       -      |            -            |
| openpai/standard | python_3.6-tensorflow_1.14.0-cpu |       -      |            -            |
| openpai/standard | python_3.6-tensorflow_1.15.0-cpu |       -      |            -            |
| openpai/standard |  python_3.6-tensorflow_2.0.0-cpu |       -      |            -            |
| openpai/standard |  python_3.6-tensorflow_2.1.0-cpu |       -      |            -            |
| openpai/standard |    python_3.6-mxnet_1.5.1-cpu    |       -      |            -            |
| openpai/standard |      python_3.6-cntk_2.7-cpu     |       -      |            -            |

The tag of these images indicates the version of the built-in deep learning framework and whether it supports GPU. Some GPU-supported dockers require a high version of your NVIDIA driver, because of the requirement of CUDA. If you are not sure about the driver version of the cluster, please ask your administrator.

## How to use Images from Private Registry

By default, OpenPAI will pull images from the [official Docker Hub](https://hub.docker.com/), which is a public docker registry. For example, the pre-built images are all available in the public registry. 

If you want to use a private registry, please toggle the `Custom` botton, then click the `Auth` button, and fill in the required information. If your authorization information is invalid, OpenPAI will inform you of an authorization failure after job submission.

   <img src="/manual/cluster-user/imgs/docker-image-auth.png" width="60%" height="60%" />