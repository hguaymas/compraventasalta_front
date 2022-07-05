import { Injectable } from '@angular/core';
declare var document: any;

@Injectable()
export class ScriptService {
    loadScript(path: string) {
        // load script
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = path;
            if (script.readyState) {  // IE
                script.onreadystatechange = () => {
                    if (script.readyState === 'loaded' || script.readyState === 'complete') {
                        script.onreadystatechange = null;
                        resolve({ loaded: true, status: 'Loaded' });
                    }
                };
            } else {  // Others
                script.onload = () => {
                    resolve({ loaded: true, status: 'Loaded' });
                };
            };
            script.onerror = (error: any) => resolve({ loaded: false, status: 'Loaded' });
            document.getElementsByTagName('head')[0].appendChild(script);
        });
    }
}
