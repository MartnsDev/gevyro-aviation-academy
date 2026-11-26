import {defineConfig} from 'eslint/config';
import next from 'eslint-config-next/core-web-vitals';
import ts from 'eslint-config-next/typescript';
export default defineConfig([...next,...ts,{ignores:['.next/**','public/vendor/**','node_modules/**','test-results/**','playwright-report/**','coverage/**']},{rules:{'react-hooks/set-state-in-effect':'off','react-hooks/refs':'off','@next/next/no-img-element':'off'}}]);
