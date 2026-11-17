export default { exports: { web: { files({read}) {return {'workspace.css':read('workspace.css'),'workspace.ts':read('workspace.ts')};} } } };
