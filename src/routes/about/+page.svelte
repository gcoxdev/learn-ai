<svelte:head><title>About this classroom · Learn AI</title></svelte:head>

<div class="page-content about-page">
  <div class="page-title">
    <span class="eyebrow">ABOUT THIS CLASSROOM</span>
    <h1>Understand the system.<br />Keep asking why.</h1>
    <p>
      Learn AI is a draft learning project for understanding how AI systems
      work, from their building blocks to the choices and limits of a complete
      design.
    </p>
  </div>

  <div class="about-sections">
    <section aria-labelledby="purpose">
      <h2 id="purpose">Start with a question you care about.</h2>
      <p>
        A language model, a robot, and a forecasting system solve different
        problems. Each learning path starts with a concrete system and follows
        its foundations in a useful order. A named reference design keeps the
        explanation specific; it is one way to build that system, not a claim
        that every system works alike.
      </p>
      <p><a href="/">Explore the learning paths</a></p>
    </section>

    <section aria-labelledby="learning">
      <h2 id="learning">Understanding travels with you.</h2>
      <p>
        Progress follows individual ideas. Demonstrate an objective through the
        required independent checks, and compatible evidence carries into other
        paths that use it. Reading a page does not award mastery. Hints and
        revealed answers are useful practice, while project artifacts need their
        own self or peer review.
      </p>
      <p>
        Side lessons provide a place to revisit a prerequisite without losing
        your place. The lesson library stays open, so you can follow a path or
        pursue a question in your own order.
      </p>
      <p><a href="/library/#how-it-works">Read how learning works</a></p>
    </section>

    <section aria-labelledby="practice">
      <h2 id="practice">Learn by doing, then remember it.</h2>
      <p>
        Lessons ask you to predict before revealing an answer, flag the classic
        mistakes, and show the real formulas from the research papers. Many
        lessons include short Python programs you can run and edit right in the
        page. Change a number, run it again, and see what happens.
      </p>
      <p>
        <strong>Daily review</strong> brings each idea you've mastered back
        after growing gaps (1, 3, 7, 16, and 35 days) as a quick practice
        question. Recalling something just as you begin to forget it is one of
        the best-tested ways to make learning last. Reviews are practice, so
        they never change what you've demonstrated.
      </p>
      <p><a href="/review/">Open daily review</a></p>
    </section>

    <section aria-labelledby="drafts">
      <h2 id="drafts">What does “draft” mean?</h2>
      <p>
        The lessons use explanations, worked examples, interactive
        illustrations, and checks for understanding. Source links let you
        investigate the underlying material. Small teaching examples make a
        mechanism easier to inspect; they are not measurements of a production
        system.
      </p>
      <p>
        Draft is a publication status, separate from your learning progress. It
        does not mean a lesson is an empty outline. Every lesson received an
        editorial reading pass in September 2026, with corrections and expanded
        examples where needed. That pass is preparation for further review,
        rather than a claim that every lesson is finished.
      </p>
      <p>A lesson is ready to leave draft when it meets all of these checks:</p>
      <ul>
        <li>
          Its goal is clear, and new words and symbols are explained before they
          are needed.
        </li>
        <li>
          A learner can follow a complete example and explain the idea in a
          different situation.
        </li>
        <li>
          Its facts, calculations, sources, and limits pass an independent
          subject review.
        </li>
        <li>
          Its questions test what was taught, with useful feedback and fair
          fresh attempts.
        </li>
        <li>
          Its reading, visuals, side lessons, and return links work accessibly.
        </li>
        <li>
          Beginner trials reveal no unresolved gaps that prevent understanding
          the stated goal.
        </li>
      </ul>
      <p>
        Length and quiz scores alone do not satisfy those checks. Assessment
        revision, independent review, and learner trials are still in progress.
        The classroom does not offer an instructor, a school qualification, or
        automatic review of your project files.
      </p>
    </section>

    <section aria-labelledby="sharing">
      <h2 id="sharing">Bring another perspective to your work.</h2>
      <p>
        At the end of a project lesson, open “Prepare a project review” to add
        notes, list your evidence, and name questions for a reviewer. Download
        the worksheet, choose which project files to share, and ask someone you
        know to challenge an assumption using the authored criteria. You can
        also use the worksheet for self review.
      </p>
      <p>
        Every lesson has “Suggest a correction.” Choose a scene, explain the
        issue, and download a feedback file with the lesson details. Share it
        through a channel you already use. Downloads do not submit feedback or
        arrange a review, and no contact details or account are required.
      </p>
      <p><a href="/library/?archetype=project">Find a project to review</a></p>
    </section>

    <section aria-labelledby="privacy">
      <h2 id="privacy">Your learning record stays in your browser.</h2>
      <p>
        Progress is stored on this device in this browser. There is no learning
        account or cloud sync. Clearing browser storage can remove the record;
        use the progress page to download and restore your own backup.
      </p>
      <p>
        Review and feedback forms keep their text only while you stay on the
        lesson. Download before leaving or reloading to keep it. Those files
        contain the lesson context and the text you chose to enter, without
        saved progress, quiz responses, or a progress backup. You control any
        sharing of the downloaded files. Following a source link takes you to
        that site's own service and privacy practices.
      </p>
      <p>
        Runnable code uses Pyodide, a version of Python that runs inside your
        browser. The first time you press Run, the page downloads the Python
        runtime (about 10 MB) from the jsDelivr content network; programs that
        import NumPy download it the same way. Your code and its output stay on
        your device.
      </p>
      <p><a href="/progress/">Manage your learning record</a></p>
    </section>
  </div>
</div>

<style>
  .about-page {
    max-width: 1080px;
  }
  .page-title {
    max-width: 720px;
  }
  .about-sections {
    max-width: 720px;
  }
  section {
    border-top: 1px solid #d7decd;
    padding: 1.6rem 0;
  }
  h2 {
    color: #314b2d;
    font:
      1.55rem/1.35 Georgia,
      serif;
    margin: 0 0 0.85rem;
  }
  section p {
    color: #56624c;
    line-height: 1.85;
    font-size: 0.92rem;
    margin: 0 0 0.8rem;
  }
  section p:last-child {
    margin-bottom: 0;
  }
  section ul {
    color: #56624c;
    font-size: 0.92rem;
    line-height: 1.85;
    padding-left: 1.4rem;
    margin: 0 0 0.8rem;
  }
  section li + li {
    margin-top: 0.45rem;
  }
  section a {
    color: #3e6133;
    text-decoration: underline;
    text-underline-offset: 0.2em;
  }
  section a:focus-visible {
    outline: 2px solid #617b4e;
    outline-offset: 4px;
  }
  @media (max-width: 600px) {
    h2 {
      font-size: 1.3rem;
    }
  }
</style>
