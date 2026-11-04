"""Identidade da release; consulta pública ao Docker Hub sem credenciais privadas."""
import json
import os
import re
import urllib.error
import urllib.request

REPOSITORY = 'd2gtrabalhos/products-service'

def metadata(version, branch, sha, run):
    if not re.fullmatch(r'(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)', version):
        raise ValueError('Versão deve ser SemVer X.Y.Z')
    if branch not in ('main', 'develop') or not re.fullmatch('[0-9a-f]{40}', sha) or not re.fullmatch('[1-9][0-9]*', run):
        raise ValueError('Branch, SHA ou execução inválidos')
    value = version if branch == 'main' else version + '-dev.' + run
    return {'version': value, 'tag': 'products-v' + value, 'image': 'docker.io/' + REPOSITORY, 'commit': sha}

def existing_image(sha, found):
    if found['revision'] != sha:
        raise ValueError('Release já existe com outro commit; incremente a versão')
    if not re.fullmatch(r'sha256:[0-9a-f]{64}', found['digest']):
        raise ValueError('Digest inválido')
    return found['digest']

def lookup(version, sha):
    with urllib.request.urlopen('https://auth.docker.io/token?service=registry.docker.io&scope=repository:' + REPOSITORY + ':pull', timeout=30) as response:
        token = json.load(response)['token']
    root = 'https://registry-1.docker.io/v2/' + REPOSITORY
    def get(path):
        req = urllib.request.Request(root + path, headers={'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.oci.image.manifest.v1+json, application/vnd.docker.distribution.manifest.v2+json'})
        return urllib.request.urlopen(req, timeout=30)
    try:
        response = get('/manifests/' + version)
    except urllib.error.HTTPError as error:
        if error.code == 404: return ''
        raise RuntimeError('Falha ao consultar registry; publicação interrompida') from None
    with response:
        digest = response.headers['Docker-Content-Digest']
        manifest = json.load(response)
    with get('/blobs/' + manifest['config']['digest']) as response:
        config = json.load(response)
    return existing_image(sha, {'revision': config['config']['Labels'].get('org.opencontainers.image.revision'), 'digest': digest})

def main():
    with open('services/products/package.json', encoding='utf-8') as stream:
        base = json.load(stream)['version']
    values = metadata(base, os.environ['BRANCH'], os.environ['SHA'], os.environ['RUN_NUMBER'])
    values['digest'] = lookup(values['version'], values['commit'])
    with open(os.environ['GITHUB_OUTPUT'], 'a', encoding='utf-8') as stream:
        for key, value in values.items(): stream.write(f'{key}={value}\n')

if __name__ == '__main__': main()
