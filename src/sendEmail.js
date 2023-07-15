const emailInput = document.querySelector("#email");
const repoInput = document.querySelector("#repo");
const submitBtn = document.querySelector("button");
const errorBox = document.querySelector("#error-message");

const SUBMIT_URL =
  "https://7pu263mpcarw3lhazop5ec7u7e0bclzu.lambda-url.us-east-1.on.aws/";

/**
 * Validates a GitHub repository URL is well-formed and exists.
 *
 * @param {string} url - The url of the github repository.
 */
async function validateGithubRepoUrl(url) {
  const repo = parsPathFromURL(url);
  const endpoint = `https://api.github.com/repos/${repo}`;
  const request = await fetch(endpoint);
  if (request.status !== 200) {
    throw new Error("The provided GitHub repo URL does not exist");
  }
  return `https://github.com/${repo}`;
}

/**
 * Converts a URL string to a path.
 *
 * @param {string} url - The URL to be parsed.
 */
function parsPathFromURL(url) {
  try {
    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }
    return new URL(url).pathname.slice(1);
  } catch {
    throw new Error("The provided URL is invalid");
  }
}

/**
 * Validates and submits the form.
 */
async function submitForm() {
  let repo = repoInput.value;
  // Browser-based form validation will catch any issues with the email address.
  if (!emailInput.reportValidity()) {
    throw new Error("Email is invalid");
  }

  // For an extra quality check, we can use the GitHub API to make sure the repo
  // URL is correct.
  try {
    repo = await validateGithubRepoUrl(repo);
  } catch (err) {
    repoInput.setCustomValidity(err.message);
    repoInput.reportValidity();
    throw new Error("Repo is invalid");
  }

  // Submit the form
  const request = await fetch(SUBMIT_URL, {
    method: "post",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: emailInput.value, githubRepoUrl: repo }),
  });
  if (!request.ok) {
    throw new Error("Request failed");
  }
}

// Listen for submit events on the form and trigger validation and submission.
document
  .querySelector("form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    errorBox.textContent = "";
    errorBox.style.display = "none";
    submitBtn.setAttribute("disabled", true);
    submitBtn.textContent = "Submitting...";
    try {
      await submitForm();
      submitBtn.textContent = "Success!";
    } catch {
      errorBox.style.display = "block";
      errorBox.textContent =
        "The form submission failed. If any errors are displayed above, please resolve them before trying again.";
      submitBtn.removeAttribute("disabled");
      submitBtn.textContent = "Submit";
    }
  });

// Clear manual repo validation when the user changes the field
repoInput.addEventListener("input", function () {
  this.setCustomValidity("");
});
