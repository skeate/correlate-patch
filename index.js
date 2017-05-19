const { parseMultiPatch } = require('git-patch-parser');

function extend(arr, len) {
  if (arr.length < len) {
    arr.splice(arr.length, 0, ...(new Array(len - arr.length)));
  }
}

function unique(arr) {
  return arr.reduce((a, b) => (a.indexOf(b) === -1 ? a.concat(b) : a), []);
}

function correlatePatch(patch) {
  const commits = parseMultiPatch(patch);
  const files = {};
  commits.forEach(({ files: commitFiles, sha }) => {
    Object.keys(commitFiles).forEach((file) => {
      if (!files[file]) {
        files[file] = {
          originalMap: {},
          oldLines: [],
          newLines: [],
        };
      }
      const fileData = commitFiles[file];
      fileData.forEach((chunk) => {
        let removedLine = chunk.lineNumbers.removed.start;
        let addedLine = chunk.lineNumbers.added.start;
        const {
          originalMap,
          oldLines,
          newLines,
        } = files[file];
        let modifier = -1;
        const tempMap = Object.assign({}, originalMap);
        chunk.lines.forEach((line) => {
          let mappedLine;
          switch (line.type) {
            case 'removed':
              if (!originalMap[removedLine + modifier]) {
                originalMap[removedLine + modifier] = removedLine - 1;
              }
              extend(oldLines, removedLine);
              mappedLine = tempMap[removedLine - 1] || removedLine - 1;
              if (mappedLine >= 0) {
                oldLines[mappedLine] = sha;
              } else {
                newLines[removedLine - 1].unshift(sha);
              }
              modifier--;
              removedLine++;
              break;
            case 'added':
              newLines[addedLine - 1] = (newLines[addedLine - 1] || []).concat(sha);
              originalMap[addedLine - 1] = -1;
              modifier++;
              addedLine++;
              break;
            default: // context
              if (!originalMap[removedLine + modifier]) {
                originalMap[removedLine + modifier] = removedLine - 1;
              }
              removedLine++;
              addedLine++;
              break;
          }
        });
      });
      files[file].newLines = files[file].newLines.map(unique);
    });
  });
  return files;
}

module.exports = correlatePatch;
