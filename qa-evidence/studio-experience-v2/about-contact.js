let contactDraft={name:"",email:"",message:""};
export function renderInfo(page,subpageContent) {
function renderAbout() {
  subpageContent.innerHTML = `
    <div class="about-page">
      <p class="subpage-eyebrow">About</p>
      <h2 id="subpage-title">Vince Doud</h2>
      <p class="about-subtitle">Teacher. Creator. Building useful things with AI.</p>
      <div class="about-layout">
        <img class="about-portrait" src="../../media/vince-doud-portrait-clean-v2.jpg" alt="Portrait of Vince Doud" />
        <div class="about-copy">
          <p>I teach, make media, build tools, and follow curiosity wherever it goes. This site is an evolving archive of the work—finished pieces, experiments, lessons, systems, and the ideas connecting them.</p>
          <p>The room is the index. Everything in it points to a part of the practice.</p>
          <div class="about-pillars">
            <section><h3>Teaching</h3><p>Media, production, and AI literacy.</p></section>
            <section><h3>Making</h3><p>Art, music, video, and useful tools.</p></section>
            <section><h3>Working on</h3><p>Organizing the archive and building what comes next.</p></section>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderContact() {
  subpageContent.innerHTML = `
    <div class="contact-page">
      <p class="subpage-eyebrow">Contact</p>
      <h2 id="subpage-title">Let’s compare notes.</h2>
      <p class="contact-intro">Send a note if you want to talk through a classroom idea, share a resource, explore a workshop, or collaborate on a practical media or AI project.</p>
      <span class="contact-accent" aria-hidden="true"></span>
      <div class="contact-layout">
        <div class="contact-direct">
          <h3>Direct contact</h3>
          <a href="mailto:hello@vincedoud.com">hello@vincedoud.com</a>
          <p>Start with what you’re working on.</p>
        </div>
        <form class="contact-form" id="contact-form" method="dialog">
          <label>Name<input type="text" name="name" autocomplete="name" maxlength="120" required /></label>
          <label>Your email<input type="email" name="email" autocomplete="email" maxlength="254" required /></label>
          <label>What are you working on?<textarea name="message" maxlength="6000" required></textarea></label>
          <button type="submit">Open email draft <span aria-hidden="true">→</span></button>
          <p class="form-status" role="status" aria-live="polite">Your email app opens a draft for you to review and send.</p>
        </form>
      </div>
    </div>
  `;

  const contactForm = subpageContent.querySelector("#contact-form");
  for(const [key,value] of Object.entries(contactDraft))contactForm.elements.namedItem(key).value=value;
  contactForm.addEventListener("input",event=>{
    const field=event.target;
    if(field.name in contactDraft){contactDraft[field.name]=field.value;field.setCustomValidity(field.value&&!field.value.trim()?"Please enter a message or name.":"");}
  });
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(contactForm);
    const name = formData.get("name").toString().trim();
    const email = formData.get("email").toString().trim();
    const message = formData.get("message").toString().trim();
    const subject = encodeURIComponent(`Website note from ${name}`);
    const body = encodeURIComponent(`${message}\n\nFrom: ${name}\nEmail: ${email}`);
    contactForm.querySelector(".form-status").textContent = "Your email draft is ready. Review it in your email app before sending.";
    window.location.href = `mailto:hello@vincedoud.com?subject=${subject}&body=${body}`;
  });
}


if(page === 'about') renderAbout(); else renderContact();
}
