'use strict';
/** 
 * @author github.com/tintinweb
 * @license MIT
 * 
 * */

class VyperSignatureHelpProvider {
    provideSignatureHelp(document, position, token, context) {
        return new Promise((resolve, reject) => {
            position = position.translate(0, -1);
            let range = document.getWordRangeAtPosition(position);
            let name;
            if (!range) {
                return reject();
            }
            name = document.getText(range);
            console.log(name);
            console.log(context);
        });
    }
}

module.exports = {
    VyperSignatureHelpProvider: VyperSignatureHelpProvider
};