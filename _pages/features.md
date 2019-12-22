## Fetch remote templates
```
  -t, --template <url>                  Full URL to a public git repo, eg github
```
A required [command line](/_pages/cli.md) argument.

All the template files to generate content are not in the core. The core downloads the template files from a git URL, eg from GitHub, of your choice.

To run the OpenAPI Nodegen it requires a valid git [template URL](/_pages/known-templates.md).

The core will `git clone` or `git pull` the given url. 

#### Targeted template version/tag fetch
To help ensure backward compatibility of future releases of the core and the templates it is possible to instruct the core to fetch a specific tag or branch of a git repository. This allows templates to be tagged for specific releases of the core.

> This was released on version 3.0.6

Targeting is handled using the same pattern seen with NPM via a trailing *#<version|branch>*
```
openapi-nodegen apifile.yml -t https://github.com/acrontum/openapi-nodegen-typescript-server.git#3.0.6
```

###### Example
With the release of version 4.0.0 of the core it brought with it the use of a 3rd party library to generate the content of the interfaces: [quicktype](https://www.npmjs.com/package/quicktype). Quicktype helped ensure better interface generation but introduced a breaking change to the interface files which required a new version of the TypeScript server template files to be released.  To ensure servers and clients built with the version 3 of the core would not pickup the new changes in version 4 of the templates; it was required that the core could pick a specific tag or branch of a tpl rgit repo.

The caveat of course is that the authors of the templates must ensure to tag their template repositories to allow this feature to operate.
Without the targeted tag/branch the default branch will be used and subsequent generations will automatically run git pull to fetch the latest changes.


#### Bypass template fetch
```
  --dont-update-tpl-cache
```
A [command line](/_pages/cli.md) argument option.

By default OpenAPI Nodegen will run a git pull on each new generation. Passing in this flag will prevent this from happening which is handy when working without internet connection.

It is required that the 1st run is done with an internet connection, this flag will subsequently just use the cached tpl file generated.

## Stub (domain) versions
The core will store the last few versions of stub files generated in a cache folder to compare future changes:
```
.openapi-nodegen/cache/compare
```

During the 1st generation this folder is populated. Subsequent generations will compare the previous files to the current generation, any difference are then printed to the console.

This allows a developer to see when and where they should make changes to their domain layer, eg new request params or method renaming. To allow other developers in a team to make use of this comparison history you would want to keep the comparison files in git.

#### Turn the comparison off
```
--dont-run-comparison-tool
```
A [command line](/_pages/cli.md) argument option when passed will not run the comparison.

If you are working alone and don't like to see too much output in the console all the time use this flag to turn the comparison tool off.


## Mocked responses
```
  -m, --mocked       If passed, the domains will be configured to return dummy content.
```
A [command line](/_pages/cli.md) argument option.

Based on the definition of the responses in the swagger/openapi file automatically return mocked responses from a generated API with the [openapi-nodegen-mockers](https://www.npmjs.com/package/openapi-nodegen-mockers) package.

The [openapi-nodegen-typescript-server](https://github.com/acrontum/openapi-nodegen-typescript-server/) use of the `--mocked` flag to injected openapi-nodegen-mockers into the [domain methods](https://github.com/acrontum/openapi-nodegen-typescript-server/blob/master/src/domains/___stub.ts.njk#L19). This allows a team to design an API first, setup a microservice quickly to deliver mocked data thus allowing the frontend dev(s) and backend dev(s) to then build without depending on each other.

## Pass full request object to ___stub method

Occasionally you will find that you just want to pass the full request object to the ___stub file method.

For example, in the typescript server it is sometimes needed that you have the full request object passed to a domain method.

This is done by adding an attribute to the swagger/openapi path object:
```
x-passRequest: true
```
EG:
```
/pets:
get:
  summary: List all pets
  operationId: petsGet
  tags:
    - pets
  responses:
    "200":
      description: A paged array of pets
      schema:
        $ref: '#/definitions/Pets'
  x-passRequest: true        
```

## Access all path attributes 

The full path object from the API spec file is passed to the [templates](/_pages/templates.md) where-in they create bespoke function for the servers and clients they produce.

Each set of templates will evolve their own specific attribute requirements. Additional attributes must be prefixed with `x-` to be seen as valid swagger/openapi.

An example of a template specific custom attribute usage: https://github.com/acrontum/openapi-nodegen-typescript-server/blob/master/src/http/nodegen/routes/___op.ts.njk#L28






