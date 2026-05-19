// Line-based merge function

function tryMerge(baseCode, serverCode, userCode) {

  const base = baseCode.split("\n");
  const server = serverCode.split("\n");
  const user = userCode.split("\n");

  const max = Math.max(base.length, server.length, user.length);

  let merged = [];
  let conflict = false;

  for (let i = 0; i < max; i++) {

    const b = base[i] || "";
    const s = server[i] || "";
    const u = user[i] || "";

    // No change
    if (s === u) {
      merged.push(s);
    }

    // Only user changed
    else if (b === s) {
      merged.push(u);
    }

    // Only server changed
    else if (b === u) {
      merged.push(s);
    }

    // Conflict
    else {
      conflict = true;
      break;
    }
  }

  return {
    success: !conflict,
    code: merged.join("\n")
  };
}

module.exports = { tryMerge };