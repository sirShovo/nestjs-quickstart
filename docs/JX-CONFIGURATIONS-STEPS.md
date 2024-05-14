# Jenkins X Configuration

## Notes:
- The `project-abbreviation` could be two letters that represent the project name, for example `bmf` for `Business Market Finders`.
- The `project-id` is the name of the project in lowercase, for example `latin-cupid` or `business-market-finders`.

## Pre-requisites

If you already have a Jenkins X and GCP configured, you can skip this section.

### Install JX ClI

https://github.com/jenkins-x/jx/releases

### Install GCloud CLI

https://cloud.google.com/sdk/docs/install

### Authenticate GCloud CLI
```bash
gcloud auth application-default login
```
### Set the project
```bash
gcloud config set project {project-id}
```
### Import cluster credentials
```bash
gcloud container clusters get-credentials dev-{project-abbreviation}-cluster --zone us-central1-a --project {project-id}
```
### Create GitHUb token

https://github.com/settings/tokens/new?scopes=repo,read:user,read:org,user:email,write:repo_hook,delete_repo,admin:repo_hook

## Import or create new project

To import or create new project to K8S, make sure all code are available in the main or master branch.

```bash
# Run this to create a new project
jx project quickstart
```

```bash
# Run this to import an existing project
jx project import
```

Go all the way to the end of the menu and select `typescript`.

## Update Github WebHook

Go to Github repo settings and update the webhook to point to the `https` URL.

## Config Helm Chart

### `.lighthouse/jenkins-x/release.yaml`

Add the following script in `.lighthouse/jenkins-x/release.yaml` at the `jx-variables` step after `resources`, to copy the config file to the container.

```yaml
script: |
  #!/usr/bin/env sh
  cp ./.config/config.yaml ./charts/{service-name}/
  jx gitops variables
```

### `.lighthouse/jenkins-x/release.yaml` & `.lighthouse/jenkins-x/pullrequest.yaml`

Then in both `pullrequest.yaml` and `release.yaml` replace the `build-npm-install` & `build-npm-test` with this configuration, update the image to the version you need.

```yaml
- image: node:18.15.0-alpine3.17
  name: build-npm-install
  resources: {}
  script: |
    #!/bin/sh
    npm install
- image: node:18.15.0-alpine3.17
  name: build-npm-test
  resources: {}
  script: |
    #!/bin/sh
    CI=true DISPLAY=:99 npm test
```
 
### `charts/{service-name}/values.yaml`

- Add the following attribute in `charts/{service-name}/values.yaml` after `podAnnotations`

```yaml
# Add common labels
commonLabels:
  release: stable
  environment: dev
  tier: backend
```

- In the same file as before, add the following after `env`

```yaml
envFrom: # Add this option if you have env variables like database credentials
  - secretRef:
      name: {service-name}

# Enable secret
secret:
  enabled: true

# Enable config
config:
  enabled: true
```

- Then replace the `probePath` to the `health` path in your service. Example: `/{service-name}/health`
- At `jxRequirements`, add the following before `ingress`

```yaml
cluster:
  clusterName: ''
  project: ''
```
- Finally, add the following after `externalDNS`

```yaml
kind: istio
```

### `charts/{service-name}/templates/_helpers.tpl`

In `charts/{service-name}/templates/_helpers.tpl` replace the following line to avoid repeating the service name

```yaml
# This line
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
# With this line
{{- printf "%s" $name | trunc 63 | trimSuffix "-" -}}
```

### `charts/{service-name}/templates/config.yaml`

Create a new file `config.yaml` in `charts/{service-name}/templates/` and copy this, here we're copying the service config file content to the container.

```yaml
{{- if .Values.config.enabled }}
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ template "fullname" . }}
  labels:
    chart: "{{ .Chart.Name }}-{{ .Chart.Version | replace "+" "_" }}"
data:
  config.yaml: |-
{{ .Files.Get "config.yaml" | indent 4 }}
{{- end }}
```

### `charts/{service-name}/templates/deployment.yaml`

- Now from the `deployment.yaml` file, we need to remove the `draft` option from `metadata -> labels` and from `template -> metadata -> labels`

- Then copy and paste this configuration at `template -> metadata -> labels` after `app`

```yaml
        app.kubernetes.io/name: {{ template "fullname" . }}
        app.kubernetes.io/instance: "{{ .Chart.Name }}-{{ .Chart.Version | replace "+" "_" }}"
        app.kubernetes.io/version: {{ .Chart.AppVersion }}
        app.kubernetes.io/component: microservice
        enable-jwt-auth: "true" # This is for the JWT authentication, you can remove it if you don't need it
        version: {{ .Chart.AppVersion }}
{{- if .Values.commonLabels }}
{{ toYaml .Values.commonLabels | indent 8 }}
{{- end }}
```

- Replace the wrong indent config:

```yaml
# Wrong
{{ toYaml .Values.podsLabels | indent 6 }}
# Correct
{{ toYaml .Values.podsLabels | indent 8 }}
```

- At `env` add the following:

```yaml
- name: {project-abbreviation}_CONFIG_PATH
  value: "/etc/{project-name}/{{ .Chart.Name }}/config.yaml"
- name: GOOGLE_APPLICATION_CREDENTIALS
  value: "/etc/{project-name}/{{ .Chart.Name }}/gcp-creds.json"
# Here you can add any env variable you need
```

- We have to set the volumes, add this before `terminationGracePeriodSeconds`

```yaml
  volumeMounts:
    - name: config
      mountPath: "/etc/{project-name}/{{ .Chart.Name }}/config.yaml"
      subPath: config.yaml
      readOnly: true
    - name: gcp-creds
      mountPath: "/etc/{project-name}/{{ .Chart.Name }}/gcp-creds.json"
      subPath: gcp-creds.json
      readOnly: true
volumes:
  - name: config
    configMap:
      name: {{ template "fullname" . }}
      items:
        - key: config.yaml
          path: config.yaml
  - name: gcp-creds
    secret:
      secretName: "{{ .Chart.Name }}-gcp-creds"
```

`volumes` is at the same indentation level as `terminationGracePeriodSeconds`

### `charts/{service-name}/templates/gcp-creds-secret.yaml`

Create this file in `charts/{service-name}/templates/` and copy this:

```yaml
{{- if .Values.secret.enabled }}
{{-  $secretKey := printf "%s-%s-%s" .Values.jxRequirements.cluster.clusterName .Release.Namespace .Chart.Name -}}
apiVersion: kubernetes-client.io/v1
kind: ExternalSecret
metadata:
  name: "{{ template "fullname" . }}-gcp-creds"
  labels:
    chart: "{{ .Chart.Name }}-{{ .Chart.Version | replace "+" "_" }}"
spec:
  backendType: gcpSecretsManager
  projectId: "{{ .Values.jxRequirements.cluster.project }}"
  data:
    - key: "{{ $secretKey }}-gcp-creds"
      name: gcp-creds.json
      property: gcp-creds.json
      version: "1"
{{- end }}
```

### `charts/{service-name}/templates/ingress.yaml`

In the first line add the following:

```yaml
{{- if (not (eq "istio" .Values.jxRequirements.ingress.kind)) }}
```

In the last line add this

```yaml
{{- end }}
```

### `charts/{service-name}/templates/secret.yaml`

If you need enviroment variables create this file in `charts/{service-name}/templates/` and copy this,
This example is made with database variables:

```yaml
{{- if .Values.secret.enabled }}
{{- $secretKey := printf "%s-%s-%s" .Values.jxRequirements.cluster.clusterName .Release.Namespace .Chart.Name -}}
apiVersion: kubernetes-client.io/v1
kind: ExternalSecret
metadata:
  name: {{ template "fullname" . }}
  labels:
    chart: "{{ .Chart.Name }}-{{ .Chart.Version | replace "+" "_" }}"
spec:
  backendType: gcpSecretsManager
  projectId: "{{ .Values.jxRequirements.cluster.project }}"
  data:
    - key: {{ $secretKey }}
      name: {project-abbreviation}_MONGODB_HOST
      property: {project-abbreviation}_MONGODB_HOST
      version: "1"
    - key: {{ $secretKey }}
      name: {project-abbreviation}_MONGODB_DATABASE_NAME
      property: {project-abbreviation}_MONGODB_DATABASE_NAME
      version: "1"
    - key: {{ $secretKey }}
      name: {project-abbreviation}_MONGODB_USERNAME
      property: {project-abbreviation}_MONGODB_USERNAME
      version: "1"
    - key: {{ $secretKey }}
      name: {project-abbreviation}_MONGODB_PASSWORD
      property: {project-abbreviation}_MONGODB_PASSWORD
      version: "1"
    - key: {{ $secretKey }}
      name: {project-abbreviation}_MONGODB_OPTIONS
      property: {project-abbreviation}_MONGODB_OPTIONS
      version: "1"
{{- end }}
```


### `charts/{service-name}/templates/destination-rule.yaml`

If your service is going to receive request from external sources, you need to create a `destination-rule.yaml` file in `charts/{service-name}/templates/` and copy this:

```yaml
{{- if (eq "istio" .Values.jxRequirements.ingress.kind) }}
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: "{{ .Values.service.name }}-destinations"
spec:
  host: "{{ .Values.service.name }}.{{ .Release.Namespace }}.svc.cluster.local"
  subsets:
    - name: v1
      labels:
        app.kubernetes.io/version: {{ .Chart.AppVersion }}
{{- end }}
```


### `charts/{service-name}/templates/virtual-service.yaml`

If your service receives request from external sources, create this file `virtual-service.yaml` in `charts/{service-name}/templates/` and copy this:

```yaml
{{- if (eq "istio" .Values.jxRequirements.ingress.kind) }}
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: "{{ .Values.service.name }}-routes"
  labels:
    chart: "{{ .Chart.Name }}-{{ .Chart.Version | replace "+" "_" }}"
spec:
  hosts:
    - api.{projecthostname}.com
  gateways:
#    - istio-system/{{ .Release.Namespace }}-gateway
    - istio-system/jx-gateway
  http:
    - name: {service-name}
      match:
        - uri:
            prefix: /v1/{public-service-name}
      rewrite:
        uri: /{service-name}/v1/{some-controller-base-path}
      route:
        - destination:
            subset: v1
            host: "{{ .Values.service.name }}.{{ .Release.Namespace }}.svc.cluster.local"
            port:
              number: 80
          weight: 100
{{- end }}
```

Here you need to add as many rules as you might need.

### Commit your changes

```bash
git add .
git commit -m "chore: update helm chart"
git pull
git push
```

## Create GCP service account

This service account needs to be created as part of infrastructure with the right permisions. For example these permisions are needed to send and receive events through PubSub:
```
Pub/Sub Publisher
Pub/Sub Subscriber
```

## Add permissions to GCP service account

- Go to `GCP -> IAM & Admin -> IAM` and add the permissions you need to the service account you created.

- Then go to `GCP -> IAM & Admin -> Service Accounts` and create a key for the service account you created.
  To do so... 
  - Search for the service account you created and click on the three dots on the right side of the row.
  - Then click on `Manage key`.
  - Then `ADD KEY -> Create new key` 
  - And select `JSON` as the key type.

## Create GCP secret

Go to `GCP -> Security -> Secret Manager` and create a new secret with the name `dev-{project-abbreviation}-cluster-jx-staging-{service-name}-gcp-creds`.


Then add the following keys:
```json
{"gcp-creds.json":{}} //content of the json key you created in the previous step
```

If you use database variables, you need to add another secret with the database credentials.
At the `Secret Manager` create a new secret with the name `dev-{project-abbreviation}-cluster-jx-staging-{service-name}`
There add a json with the environment variables you need. Example:
```json
{"SN_MONGODB_DATABASE_NAME":"{service-name}","SN_MONGODB_HOST":"{db-host}","SN_MONGODB_OPTIONS":"{db-options}","SN_MONGODB_PASSWORD":"{db-password}","SN_MONGODB_USERNAME":"{db-username}","SN_CDN_SIGNING_KEY":"{another-secret}"}
```
