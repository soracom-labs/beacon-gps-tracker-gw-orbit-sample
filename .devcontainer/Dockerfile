FROM node:12-buster

RUN apt-get update && apt-get install -y \
	wabt \
	&& rm -fr /var/lib/apt/lists

RUN curl -L -o - https://github.com/soracom/soracom-cli/releases/download/v0.6.1/soracom_0.6.1_linux_amd64.tar.gz | tar zxf - \
	&& mv ./soracom_0.6.1_linux_amd64/soracom /usr/local/bin/ \
	&& rmdir ./soracom_0.6.1_linux_amd64

COPY ./soracom-orbit-tools-vscode.vsix /root
