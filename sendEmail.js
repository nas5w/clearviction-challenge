async function validateGithubRepoUrl(url) {
  const repo = parsRepoFromURL(url);
  const endpoint = `https://api.github.com/repos/${repo}`;
  const request = await fetch(endpoint);
  if (request.status !== 200) {
    throw new Error("The provided GitHub repo URL does not exist");
  }
}

function parsRepoFromURL(url) {
  const path = url.split(/github.com\//i)[1];
  if (!path || !path.includes("/")) {
    throw new Error("The provided GitHub URL is invalid");
  }
  return path;
}

async function submitForm() {
  try {
    const email = document.querySelector("#email").value;
    const repo = document.querySelector("#repo").value;
    // Browser-based form validation will catch any issues with the email address.
    // For an extra quality check, we can use the GitHub API to make sure the repo
    // URL is correct.
    await validateGithubRepoUrl(repo);
  } catch (err) {
    console.log(err.message);
  }
}

document.querySelector("form").addEventListener("submit", function (event) {
  event.preventDefault();
  submitForm();
});
