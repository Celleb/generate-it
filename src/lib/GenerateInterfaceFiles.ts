import GenerateOperationFileConfig from '@/interfaces/GenerateOperationFileConfig';

const prettier = require('prettier');
const fs = require('fs-extra');
const path = require('path');
const namingUtils = require('./helpers/NamingUtils');
const TemplateRenderer = require('./TemplateRenderer');

class GenerateInterfaceFiles {
  public config: GenerateOperationFileConfig;

  constructor (config: GenerateOperationFileConfig) {
    this.config = config;
  }

  public async writeFiles () {
    const swagger = this.config.data.swagger;
    this.iterateInterfaces(swagger);
  }

  public iterateInterfaces (swagger: any) {
    swagger.interfaces.forEach((interace: any) => {
      this.parseDefinition(interace.content, interace.name);
    });
  }

  public parseDefinition (interfaceText: string, definitionName: string) {
    const filePath = path.join(this.config.root, this.config.file_name);
    const data = fs.readFileSync(filePath, 'utf8');

    const subdir = this.config.root.replace(new RegExp(`${this.config.templates_dir}[/]?`), '');
    const ext = namingUtils.getFileExt(this.config.file_name);
    const newFilename = definitionName + '.' + ext;
    const targetFile = path.resolve(this.config.targetDir, subdir, newFilename);
    let content = TemplateRenderer.load(data.toString(), {
      definitionName,
      definitionInterfaceText: interfaceText,
    });

    content = content.replace(new RegExp('&' + '#' + 'x27;', 'g'), '\'');
    content = prettier.format(content, {
      indent_size: 2,
      space_in_empty_paren: true,
      end_with_newline: true,
      semi: true,
      singleQuote: true,
      parser: ext === 'ts' ? 'typescript' : 'babel',
    });

    const moduleType = subdir.substring(subdir.lastIndexOf('/') + 1);
    if (this.config.data.ignoredModules && this.config.data.ignoredModules.includes(moduleType) && fs.existsSync(targetFile)) {
      throw new Error('file exists');
    }
    fs.writeFileSync(targetFile, content, 'utf8');
    return true;
  }
}

export default GenerateInterfaceFiles;