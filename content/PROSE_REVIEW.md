# Prose and lesson flow review — September 20, 2026

All **335 lessons** received an individual reading pass: 311 main lessons, 23 math/programming bridges, and the preserved expert-model preview. **307 received targeted prose, title, summary, sequencing, or takeaway revisions.** Shared closing guidance was normalized in 333 lessons, and 69 text-mode placeholders were replaced with the actual explanation. The targeted count excludes these shared consistency changes.

The review read all routed teaching scenes, including optional extensions, with summaries, worked examples, tables, figure descriptions, inline practice prompts, and closing takeaways. It applied writing and teaching criteria: natural phrasing, definitions before use, coherent examples, manageable conceptual steps, meaningful transitions, and memorable conclusions. This is an editorial pass by the implementation assistant, not an independent subject review or a learner study. Publication status remains draft.

## Main changes

- Integrated beginner definitions into the explanation instead of appending them after a dense technical paragraph. LoRA, RLHF, MDPs, robot pose, and neural ODEs are examples.
- Removed repeated definitions, forced slogans, inconsistent analogies, and caveats unrelated to the immediate teaching point. Existing concrete examples and advanced mechanisms were retained where useful.
- Moved calculations beside the concepts they explain: latency with latency, ant-colony evaporation with ant-colony search, and self-organizing-map updates with map learning.
- Gave unigram tokenization a separate scene between tokenizer-use rules and coverage evaluation. Its previous scene also tried to explain several other mechanisms; the new scene preserves all existing scene IDs.
- Shortened takeaways to the distinction or consequence a learner should remember, rather than reproducing formal objectives or lists of jargon.
- Corrected small accuracy and interpretation problems: a net gain of four correct answers need not mean only four answers changed; log zero is nonfinite rather than necessarily NaN; moving a sampling draw changes the selected token only when it crosses an interval boundary.
- Identified checkpoint-selection examples as validation before presenting their scores. Clarified local project review and kept project quizzes distinct from grading unseen artifacts.
- Made ordinary closing instructions match in presentation and text modes. Preserved the explicit practice-only boundaries of the advanced preview and optional formal-math checks.

## Compatibility and verification

A structured comparison against commit `75ed194` confirms that all 337 objective definitions and versions, all 1928 active/retired assessment variants (including answers and feedback), all 2233 existing scene IDs, sources, bridges, figure/simulation configurations, and navigation aliases remain unchanged. The only route addition is `tokenizer-training.compare-unigram`; removing that added ID reproduces the original routes. Lesson revision metadata changes, but prior assessment evidence is not relabeled or upgraded.

Validation passed: Svelte/TypeScript reports zero errors or warnings; all 213 logic/content tests and all 90 Chromium scenarios pass; the production build contains 335 lesson pages and 15 path pages. Five selected revised scenes were also checked at phone width in presentation and continuous reading, including saved-position restoration and the new tokenizer scene's order. Two of those mobile pages received screenshot inspection. All 335 snapshot hashes match the reviewed files.

Automated validation checks delivery and compatibility; it does not establish that every question is educationally sound or that learners find every explanation clear. This pass did not freshly verify all external references or revalidate every assessment bank. The dated model case studies retain their pinned source claims.

The [authoring standards](AUTHORING.md#prose-and-lesson-flow) now explain how to maintain the same prose and flow. The adjacent [snapshot](PROSE_REVIEW_SNAPSHOT.json) records each reviewed asset's final hash. Earlier [review](LESSON_REVIEW.md) and [follow-up](REVIEW_FOLLOWUP.md) records remain historical evidence of their own revisions.

## Lesson-by-lesson record

“Revised” means a targeted edit; “retained” means the teaching prose was kept after reading, apart from shared closing or text-mode consistency changes. Neither designation is a release approval.

| Slot | Lesson | Decision | Finding |
| --- | --- | --- | --- |
| A01 | [Follow a token through a mixture of experts](lessons/experts.yaml) | Revised | Integrated acronym and router definitions; explained weighted combination once in arithmetic order and kept preview credit limits. |
| B01 | [The numbers you actually need](lessons/arithmetic.yaml) | Retained | Reviewed the full counters-to-squared-error progression; definitions and worked steps already fit a first-time learner. |
| B02 | [Read an equation one symbol at a time](lessons/algebra-notation.yaml) | Retained | Reviewed snack example, substitution, model roles, indices and solving; retained the existing clear sequence. |
| B03 | [A function is a rule](lessons/functions.yaml) | Revised | Removed an unnecessary aside interrupting the first definition. |
| B04 | [Powers and logarithms, one step at a time](lessons/powers-logs.yaml) | Revised | Kept exact softmax arithmetic and stability explanation; made summary and takeaway more direct. |
| B05 | [Sets, graphs, and counting possibilities](lessons/discrete-math.yaml) | Revised | Integrated repeated set definitions and examples in a single order. |
| B06 | [Vectors: lists that work together](lessons/vectors.yaml) | Revised | Removed premature attention vocabulary and syllabus-style closing; preserved all arithmetic. |
| B07 | [Follow shapes through a numerical layer](lessons/matrices-tensors.yaml) | Retained | Reviewed every trip calculation, shape convention and bias broadcast; retained the clear worked sequence. |
| B08 | [Directions, eigenvectors, and low-rank structure](lessons/linear-algebra-depth.yaml) | Revised | Integrated singular-value and rank definitions before compression example. |
| B09 | [Probability without the mystery](lessons/probability.yaml) | Revised | Retained clear bag example, conditional update and repeated-draw explanation; simplified summary. |
| B10 | [Averages over uncertain outcomes](lessons/random-variables.yaml) | Revised | Separated named distributions from spread calculation and removed duplicated variance arithmetic. |
| B11 | [What can a small experiment tell us?](lessons/statistics-evidence.yaml) | Revised | Kept precise interval and p-value interpretations plus worked bootstrap and multiple-testing examples; simplified takeaway. |
| B12 | [A derivative is a local change](lessons/derivatives.yaml) | Retained | Reviewed the complete finite-step-to-limit derivation and loss update; retained the well-scaffolded sequence. |
| B13 | [Several inputs, several rates of change](lessons/multivariable-calculus.yaml) | Revised | Retained coherent two-weight gradient, local approximation and Jacobian examples. |
| B14 | [The chain rule, one step at a time](lessons/chain-rule.yaml) | Retained | Reviewed both exact calculations and branching-path explanation; retained the coherent examples. |
| B15 | [Add up a continuous quantity](lessons/integrals-density.yaml) | Revised | Clarified that the fundamental-theorem calculation uses a different rate from the preceding triangle example. |
| B16 | [Choose a direction and a step size](lessons/optimization-math.yaml) | Revised | Introduced second derivative, Hessian and convexity before their consequences. |
| B17 | [Measure surprise and compare distributions](lessons/information-theory.yaml) | Revised | Removed irrelevant consciousness aside and introduced KL expansion with its definition. |
| B18 | [When the computer cannot store the exact number](lessons/numerical-computing.yaml) | Retained | Reviewed representation, rounding, stable softmax and tolerance examples; retained the clear explanations. |
| B19 | [Follow a changing state through time](lessons/dynamics-and-noise.yaml) | Revised | Integrated Brownian definition with scaling and separated the stochastic worked step. |
| B20 | [Value a choice and its later consequences](lessons/decisions-and-games.yaml) | Revised | Replaced formal unilateral-deviation phrasing with its meaning before the game example. |
| B21 | [Count work, memory, and parallel limits](lessons/algorithm-cost.yaml) | Retained | Retained linear/quadratic counting, bandwidth and serial-fraction examples; reviewed notation introduction. |
| B22 | [Make a small experiment repeatable](lessons/python-experiments.yaml) | Revised | Retained executable small example, explained syntax and reproducibility guidance; clarified NumPy first mention. |
| B23 | [Distances, neighborhoods, and transformations](lessons/geometry-and-symmetry.yaml) | Revised | Led with the circular-track example before manifold and topology terminology. |
| M00.1 | [What is AI? Start with an everyday task](lessons/ai-systems.yaml) | Revised | Kept the button example; removed repeated definitions and distracting claims about childhood or feelings. |
| M00.2 | [Inputs and outputs: what goes in and what comes out](lessons/inputs-and-outputs.yaml) | Revised | Kept the linked sorting example; made task wording natural and removed an unnecessary aside about arrows. |
| M00.3 | [Data and examples: what a computer can learn from](lessons/data-and-examples.yaml) | Retained | Retained the coherent progression from observations to examples, labels, mistakes, and a paper activity. |
| M00.4 | [What is a model? A small rule inside a bigger app](lessons/models-and-products.yaml) | Revised | Kept the snack-to-app progression; removed an odd person-in-the-computer comparison and tightened the example transition. |
| M00.5 | [Weights: the adjustable numbers in a model](lessons/weights-and-predictions.yaml) | Revised | Removed distracting nontechnical meanings; kept one consistent crackers-per-guest example. |
| M00.6 | [Training and inference: changing a rule or using it](lessons/training-and-inference.yaml) | Revised | Tightened the opening and connected loss directly to the optimizer. |
| M00.7 | [Follow one small AI system from start to finish](lessons/inside-a-system.yaml) | Revised | Replaced abstract role and boundary wording with the concrete delivery steps. |
| M00.8 | [Different ways to solve the same problem](lessons/ai-traditions.yaml) | Revised | Kept rules, search, and estimates in one route example; replaced admonitions about memorization with a useful recap. |
| M00.9 | [How to tell whether an AI answer is useful](lessons/thinking-critically.yaml) | Revised | Kept the concrete evidence and error-count examples; removed commentary about how the learner should memorize. |
| M00.10 | [How to use this school without getting lost](lessons/learning-routes.yaml) | Revised | Simplified permission-like language and kept the practical explanation of paths, side lessons, and reading modes. |
| M00.11 | [Practice, progress, and knowing what you understand](lessons/mastery-and-placement.yaml) | Revised | Replaced software-facing assessment jargon with direct descriptions of what the learner sees. |
| M01.1 | [AI grew from several older questions](lessons/history-foundations.yaml) | Revised | Kept the room-heating thread and definitions; shortened the abstract opening and closing. |
| M01.2 | [Neurons, learning rules, and the Dartmouth proposal](lessons/early-ai-proposals.yaml) | Revised | Preserved dates and contributions; replaced lecture-like instructions with a concrete way to read the history. |
| M01.3 | [Symbols, games, and early language programs](lessons/symbolic-era.yaml) | Revised | Kept the delivery trace; replaced distracting mechanical-person wording with an explanation of the achievement. |
| M01.4 | [Limits, expectations, and changing support](lessons/ai-winters.yaml) | Revised | Integrated the later-added perceptron definition into the first explanation, removing the repeated threshold description. |
| M01.5 | [From knowledge engineering to learning from data](lessons/expert-to-statistical.yaml) | Revised | Led with the repair example and reduced repeated cautionary prose while retaining the historical scope. |
| M01.6 | [Why deeper networks became practical](lessons/deep-learning-revival.yaml) | Revised | Removed a distracting historical disclaimer and brought the 2006 training example into a clearer transition. |
| M01.7 | [Games, attention, and broadly reusable models](lessons/foundation-model-era.yaml) | Revised | Made the AlphaGo insertion a clear comparison with model reuse, instead of an unexplained jump in subject. |
| M01.8 | [The questions that shaped AI](lessons/history.yaml) | Revised | Preserved the cross-tradition historical map; replaced rhetorical contrasts with direct connections. |
| M02.1 | [How a computer stores a picture or a sentence](lessons/digital-representations.yaml) | Retained | Retained the orderly bit-to-byte-to-media progression, concrete counts, and local definitions. |
| M02.2 | [Describe a computation so someone else can follow it](lessons/algorithms-and-programs.yaml) | Retained | Retained the precise parcel task, readable pseudocode, trace table, and boundary cases. |
| M02.3 | [What a representation makes easy to learn](lessons/features-and-bias.yaml) | Retained | Retained the lost-information example and the clear separation of three meanings of bias. |
| M02.4 | [Trace an example through a batch](lessons/tensor-shape-tracing.yaml) | Retained | Retained labeled axes, one continuous parcel example, and calculations with explicit units. |
| M02.5 | [Why a small choice can create a huge search](lessons/search-growth.yaml) | Retained | Retained the tree drawn level by level, distinction between level and total, and budget example. |
| M02.6 | [Repeat an experiment without confusing luck with truth](lessons/randomness-reproducibility.yaml) | Retained | Retained the worked generator and useful distinction between repeatability and reliability. |
| M02.7 | [What makes an accelerator useful?](lessons/processors-and-parallelism.yaml) | Retained | Retained the connected calculation of speedup, memory transfer, latency, and throughput. |
| M02.8 | [What a demonstration proves—and what it leaves open](lessons/toy-model-limits.yaml) | Retained | Retained the small rule, counterexample, repair, and fresh-evaluation sequence. |
| M03.1 | [From the world to a dataset](lessons/data.yaml) | Retained | Retained the continuous delivery table example and the clear input, target, split, and provenance sequence. |
| M03.2 | [Different ways to learn](lessons/ways-to-learn.yaml) | Revised | Kept the four concrete sources of feedback; removed the odd product-personality metaphor. |
| M03.3 | [Where did this dataset come from?](lessons/data-provenance.yaml) | Revised | Kept the source-card activity; translated the list of transformations into familiar actions. |
| M03.4 | [Clean data without erasing the problem](lessons/data-cleaning.yaml) | Retained | Retained the unit correction, missing-value example, and worked training-only mean. |
| M03.5 | [Protect the examples used to judge a model](lessons/splits-and-leakage.yaml) | Revised | Retained the three-envelope explanation and concrete examples of grouped and time-based splits. |
| M03.6 | [Who is represented by the data?](lessons/sampling-and-shift.yaml) | Revised | Put population, sample, and distribution definitions before their use; joined each kind of shift to the delivery example. |
| M03.7 | [Create more examples without inventing evidence](lessons/augmentation-and-synthetic-data.yaml) | Revised | Defined augmentation before examples, connected invariance to the circle, and put split protection before evaluation. |
| M03.8 | [Decide what success means before training](lessons/baselines-and-success.yaml) | Revised | Put the metric definition before the cost example; separated the worked comparison from decision-policy vocabulary. |
| M04.1 | [Reason with statements that are true or false](lessons/propositional-logic.yaml) | Revised | Explained implication through its four cases and introduced premises before entailment. |
| M04.2 | [Talk about objects and relationships](lessons/first-order-logic.yaml) | Revised | Introduced predicates with the family example and removed the duplicated unification trace. |
| M04.3 | [From facts to conclusions—and backward from a goal](lessons/rule-engines.yaml) | Revised | Led with an order and defined the three parts around it; removed the unnecessary person comparison. |
| M04.4 | [Search for a proof or a satisfying assignment](lessons/proof-search.yaml) | Revised | Put SAT vocabulary before the worked case and moved undecidability explanation beside its definition. |
| M04.5 | [Store relationships so they can be queried](lessons/knowledge-graphs.yaml) | Revised | Started with the drawable graph, explained ontology locally, and combined repeated open-world paragraphs. |
| M04.6 | [Reason when new facts can overturn a conclusion](lessons/defaults-and-exceptions.yaml) | Revised | Kept one library example through the first two scenes and introduced technical terms after the everyday distinction. |
| M04.7 | [Search for a program that fits a specification](lessons/program-synthesis.yaml) | Revised | Started with the crackers task and introduced specification and search space before synthesis terminology. |
| M04.8 | [Combine explicit knowledge with learned perception](lessons/symbolic-neural-boundaries.yaml) | Revised | Integrated grounding into the cup observation and made the format-versus-fact example the lead explanation. |
| M05.1 | [Turn a goal into states and actions](lessons/search-problems.yaml) | Revised | Defined the state before discussing missing history; kept the two-route calculation. |
| M05.2 | [Choose an order for exploring possibilities](lessons/uninformed-search.yaml) | Revised | Put queue and stack examples before guarantees; explained the frontier once. |
| M05.3 | [Use an estimate without confusing it with a guarantee](lessons/heuristic-search.yaml) | Revised | Explained A-star notation before calculation and integrated the consistency example with its definition. Final consistency cleanup. |
| M05.4 | [Remove impossible choices before searching further](lessons/constraint-solving.yaml) | Revised | Merged duplicate SAT/SMT definitions and connected them to scheduling. |
| M05.5 | [Plan while another player chooses the reply](lessons/game-search.yaml) | Revised | Preserved the minimax and pruning calculation; introduced rollout and backup as steps in Monte Carlo tree search. |
| M05.6 | [Represent what an action requires and changes](lessons/classical-planning.yaml) | Revised | Retained the parcel trace and crane timing example; simplified the closing list of formal concepts. |
| M05.7 | [Plan when you cannot see the whole state](lessons/planning-under-uncertainty.yaml) | Revised | Put each uncertainty criterion beside its explanation and removed repetition. |
| M05.8 | [Improve a candidate without exploring every path](lessons/local-search.yaml) | Revised | Defined candidates and objectives through one timetable example; replaced the unexplained basin metaphor. |
| M06.1 | [Probability, likelihood, and what is unknown](lessons/uncertainty-models.yaml) | Revised | Retained the counters and likelihood examples; connected uncertainty terminology to observations and parameters. |
| M06.2 | [Update a belief using new evidence](lessons/bayes-rule.yaml) | Revised | Introduced prior and posterior within the detector story; derived normalization from the counts before stating the compact rule. |
| M06.3 | [A useful classifier with a strong independence assumption](lessons/naive-bayes.yaml) | Revised | Introduced conditional independence through message clues; made both class calculations one uninterrupted worked example. |
| M06.4 | [Factor a joint distribution into smaller pieces](lessons/graphical-models.yaml) | Revised | Put graph vocabulary before factorization and made explaining away a single coherent explanation. |
| M06.5 | [Track a hidden state from noisy observations](lessons/state-estimation.yaml) | Revised | Defined hidden state, HMM, and Kalman terms before using them; kept both numerical updates. |
| M06.6 | [Estimate a difficult average by sampling](lessons/monte-carlo.yaml) | Revised | Put the sampling example before abstract expectation language; expanded MCMC before its procedure. |
| M06.7 | [Learn distributions over plausible explanations](lessons/bayesian-learning.yaml) | Revised | Retained the already integrated snack, Gaussian-process, and approximation explanations; simplified the takeaway. |
| M06.8 | [Turn a probability into a justified action](lessons/calibrated-decisions.yaml) | Revised | Retained the explicit cost convention and calculations; joined recalibration guidance into one sequence. |
| M07.1 | [Build a tiny prediction model](lessons/prediction.yaml) | Retained | Retained the clear progression from weight and intercept to residual and loss; each calculation has a defined role. |
| M07.2 | [Turn a linear score into a class probability](lessons/logistic-regression.yaml) | Revised | Retained the already integrated mail example, sigmoid arithmetic, loss, and decision cutoff. |
| M07.3 | [Predict from similar stored examples](lessons/nearest-neighbors.yaml) | Revised | Introduced k and prediction types through the delivery example; moved the distance definition before its consequences. |
| M07.4 | [Split a dataset into simpler regions](lessons/decision-trees.yaml) | Revised | Replaced an abrupt area/age example with the parcel example used to explain tree parts. |
| M07.5 | [Combine many imperfect predictors](lessons/tree-ensembles.yaml) | Revised | Introduced ensemble and bootstrap before bagging; kept the averaging and boosting arithmetic. |
| M07.6 | [Choose a boundary with a margin](lessons/support-vector-machines.yaml) | Revised | Led with the line-and-gap picture and placed kernel vocabulary in calculation order. |
| M07.7 | [Control complexity without peeking at the answer](lessons/regularization-and-tuning.yaml) | Revised | Kept parameter and hyperparameter distinction; made folds and the three-part example lead cross-validation. |
| M07.8 | [Look inside the average score](lessons/classification-metrics.yaml) | Revised | Defined positive through defects before formal counts; joined ROC/AUC definitions to their purpose. |
| M08.1 | [Find groups that help with your task](lessons/clustering.yaml) | Revised | Moved the mean calculation next to the center update and defined linkage where it first appears. |
| M08.2 | [Let several hidden sources explain the data](lessons/mixture-models.yaml) | Revised | Introduced the parcel sources before the mixture formula and put E/M names beside their operations. |
| M08.3 | [Compress variation into fewer directions](lessons/pca-and-factorization.yaml) | Revised | Started PCA with its purpose, introduced geometric terms locally, and integrated the centered-point trace. |
| M08.4 | [Read a data map with care](lessons/nonlinear-embeddings.yaml) | Revised | Put the representation definition before the mapping problem and connected prototypes directly to their update. |
| M08.5 | [Find unusual cases worth investigating](lessons/anomaly-detection.yaml) | Revised | Retained distinct detection mechanisms and the sensor example; simplified the long title and closing statement. |
| M08.6 | [Create a learning task from the data itself](lessons/self-supervised-representations.yaml) | Revised | Introduced views before contrastive pairs and explained the evaluation terms in the order a learner needs them. |
| M08.7 | [Estimate what a person may find useful](lessons/recommendation-models.yaml) | Revised | Kept the interaction-table explanation; combined the repeated vector calculation and clarified the closing distinction. |
| M08.8 | [Learn from choices that your system helped create](lessons/recommendation-feedback.yaml) | Revised | Introduced the logging policy and propensity before the correction method; kept the concrete click-rate comparison. |
| M09.1 | [Will the model work on new examples?](lessons/generalization.yaml) | Revised | Introduced empirical and expected error through the observed-loss calculation. |
| M09.2 | [Why a simpler model can predict better](lessons/bias-variance.yaml) | Revised | Retained the repeated-dataset explanation and distinct meanings of bias; simplified the closing point. |
| M09.3 | [What can a learning guarantee actually guarantee?](lessons/learning-theory.yaml) | Revised | Defined PAC by its two separate promises; removed an unrelated classroom-grading aside. |
| M09.4 | [Test the rule where conditions change](lessons/robustness-and-shift.yaml) | Revised | Defined shifts and perturbations before discussing robustness claims. |
| M09.5 | [Evaluate the procedure that chose the model](lessons/evaluation-selection.yaml) | Retained | Retained the coherent library-assistant comparison, decision rule, and per-case evaluation. |
| M09.6 | [Change one thing and measure what follows](lessons/controlled-experiments.yaml) | Revised | Led ablation with its definition and paired comparison with the full calculation. |
| M09.7 | [More capacity changes more than one thing](lessons/scaling-and-memorization.yaml) | Revised | Retained the bounded numerical examples; replaced a topic-list takeaway with the central lesson. |
| M09.8 | [Make the result possible to inspect](lessons/research-reporting.yaml) | Revised | Corrected a net improvement being mistaken for the count of changed cases; retained the practical report card. |
| M10.1 | [How does a model improve a prediction?](lessons/learning-update.yaml) | Revised | Retained the full worked update; made activity instructions natural and shortened the closing recap. |
| M10.2 | [Check a derivative against a small change](lessons/gradient-checks.yaml) | Revised | Defined the symbols before finite differences and connected diagnostic terms to the sum-versus-mean example. |
| M10.3 | [Learn from a sample of examples at each step](lessons/stochastic-gradients.yaml) | Revised | Introduced batch vocabulary before distinctions and integrated the weighted microbatch example. |
| M10.4 | [How momentum and Adam use earlier gradients](lessons/momentum-and-adam.yaml) | Revised | Put buffer, beta, exponential average, and moments before use; removed repeated definitions. |
| M10.5 | [Constrain a solution or change the update](lessons/penalties-and-clipping.yaml) | Revised | Put Euclidean norm before the clipping calculation and kept the distinction from per-coordinate clamping. |
| M10.6 | [Read the shape of a loss landscape](lessons/loss-landscapes.yaml) | Revised | Moved scalar, curvature, preconditioning, and convexity definitions before their consequences; shortened the title. |
| M10.7 | [Keep signals and gradients in a usable range](lessons/stable-training.yaml) | Revised | Defined activation and connection counts before initialization guidance; corrected the logarithm-of-zero nonfinite example. |
| M10.8 | [Find the first broken assumption in a training run](lessons/training-debugging.yaml) | Revised | Retained the ordered diagnostic trace and one-weight calculation; made the closing instruction direct. |
| M11.1 | [Inside an artificial neuron](lessons/neurons.yaml) | Revised | Retained the complete multiply-add-activate trace; removed the unnecessary tiny-person aside. |
| M11.2 | [Why layers need more than multiplication](lessons/nonlinearity.yaml) | Retained | Retained the four-case XOR construction and the clear distinction between representing and learning a rule. |
| M11.3 | [Trace inputs through layers to a loss](lessons/neural-forward-pass.yaml) | Revised | Kept the explicit switch between the two diagrams; removed mystical wording and clarified the output’s role. |
| M11.4 | [How an error reaches earlier weights](lessons/backpropagation.yaml) | Retained | Retained the coherent forward/backward/update example and the shared-parameter branch calculation. |
| M11.5 | [Let the graph carry derivatives](lessons/automatic-differentiation.yaml) | Retained | Retained the two-branch calculation, detached-path contrast, and deliberate accumulation example. |
| M11.6 | [Help information and learning signals travel](lessons/residuals-normalization-dropout.yaml) | Revised | Removed distracting bias and metaphor asides; kept the numerical examples for each distinct operation. |
| M11.7 | [Connect data, gradients, and saved model state](lessons/neural-training-loop.yaml) | Revised | Retained all calculations and diagram transitions; replaced an unexplained target-shift reference. |
| M11.8 | [What can a network’s hidden features tell us?](lessons/learned-representations.yaml) | Revised | Defined hidden vector, encoder, and head before discussing their roles; kept the probe-versus-use counterexample. |
| M12.1 | [What changes when an image changes?](lessons/image-geometry.yaml) | Revised | Put pixels, channels, and task-specific invariance into concrete explanations before their consequences. |
| M12.2 | [Slide a shared filter across an input](lessons/convolution.yaml) | Revised | Introduced filters through their operation; removed the repeated receptive-field definition and grouped size controls together. |
| M12.3 | [Build visual features from local operations](lessons/convolutional-networks.yaml) | Revised | Expanded CNN before use and removed repeated feature-map explanations. |
| M12.4 | [Locate objects and label their pixels](lessons/detection-and-segmentation.yaml) | Revised | Used the two-cat image to define outputs and integrated the overlap arithmetic. |
| M12.5 | [Treat image patches as a sequence of representations](lessons/vision-transformers.yaml) | Revised | Introduced patch tokens and projection in one calculation before discussing transformer blocks. |
| M12.6 | [Learn visual features before choosing the final task](lessons/visual-pretraining.yaml) | Revised | Led with masking a bicycle image and explained pretraining before the abstract objective. |
| M12.7 | [Infer structure that a flat image does not directly reveal](lessons/depth-motion-3d.yaml) | Revised | Put the coin example before identifiability language and integrated the definitions of 3D representations. |
| M12.8 | [Test what the visual model is actually using](lessons/vision-failures.yaml) | Revised | Started occlusion with the partly hidden mug; kept the concrete background and perturbation tests. |
| M13.1 | [Predict the future without borrowing information from it](lessons/time-series.yaml) | Revised | Defined origin and horizon through noon-to-one forecasting; moved the rolling test into the evaluation scene. |
| M13.2 | [Carry a state from one step to the next](lessons/recurrent-networks.yaml) | Revised | Expanded RNN and defined state before describing the recurrence; combined the unrolling definition with backpropagation. |
| M13.3 | [Choose what to keep, add, and reveal](lessons/gated-recurrence.yaml) | Revised | Introduced gate behavior and LSTM/GRU names before formulas, removing repeated explanations. |
| M13.4 | [Map one sequence into another](lessons/sequence-to-sequence.yaml) | Revised | Placed token, encoder, and decoder definitions into the translation example instead of adding them after the technical explanation. |
| M13.5 | [From a waveform to time-frequency features](lessons/audio-representations.yaml) | Revised | Introduced amplitude and frequency before sampling limits; merged the repeated spectrogram definitions. |
| M13.6 | [Map sound into words with an alignment model](lessons/speech-recognition.yaml) | Revised | Expanded CTC before its mechanics and integrated the blank-collapse example. |
| M13.7 | [Generate sound from a representation](lessons/speech-and-audio-generation.yaml) | Revised | Introduced prosody through a spoken example and defined vocoder and codec within their generation routes. |
| M13.8 | [Judge quality across time, languages, and delay](lessons/sequence-evaluation.yaml) | Revised | Retained the meaning-changing word example and timing distinctions; shortened the abstract takeaway. |
| M14.1 | [Words, structure, meaning, and context](lessons/language-structure.yaml) | Revised | Retained the concrete role swap, ambiguous reference, negation, and paraphrase sequence; simplified one metaphor. |
| M14.2 | [Turn text into structured labels and relations](lessons/linguistic-annotation.yaml) | Revised | Defined annotation and schema before introducing tagging, spans, and parsing. |
| M14.3 | [Represent text with counts and short contexts](lessons/count-based-language.yaml) | Retained | Retained the complete red/cat/dog count example, denominator explanation, smoothing, and held-out check. |
| M14.4 | [How text becomes tokens](lessons/tokenization.yaml) | Revised | Removed an odd object-with-meaning opening while retaining IDs, unit choices, and compatibility examples. |
| M14.5 | [From token IDs to learned vectors](lessons/embeddings.yaml) | Revised | Defined vector and dimension within the first row lookup; combined the similarity example with its arithmetic. |
| M14.6 | [Learn the units used by a language model](lessons/tokenizer-training.yaml) | Revised | Separated the late unigram explanation from the text-coverage scene so each slide has one topic. |
| M14.7 | [One vocabulary does not divide every language equally](lessons/tokenization-tradeoffs.yaml) | Revised | Retained the language, identifier, and normalization examples; made the closing comparison practical. |
| M14.8 | [How a language model takes its next step](lessons/next-token.yaml) | Revised | Retained the generation trace and optional perplexity derivation; removed repeated course-scope commentary. |
| M15.1 | [Look back at the information needed for this step](lessons/attention-motivation.yaml) | Revised | Defined encoder and decoder within the fixed-summary problem; combined the repeated weighted-mixture arithmetic. |
| M15.2 | [Attention: queries, keys, and values](lessons/attention.yaml) | Retained | Retained the roles-before-arithmetic route and changed-value extension; each example isolates a distinct part of attention. |
| M15.3 | [From attention scores to a causal mask](lessons/softmax-attention.yaml) | Revised | Introduced logarithm and exponential notation before the softmax calculation; removed its repeated explanation. |
| M15.4 | [Run several learned comparisons in parallel](lessons/multi-head-attention.yaml) | Revised | Retained the two scalar mixtures and concatenation trace; replaced a job-title metaphor in the takeaway. |
| M15.5 | [Give a transformer information about order](lessons/positional-encodings.yaml) | Revised | Retained the role-swap, additive-vector, and shared-rotation examples; softened a dense first technical sentence. |
| M15.6 | [Separate mixing across tokens from transforming one token](lessons/transformer-block-components.yaml) | Revised | Explained position-wise computation before its contrast with attention, and integrated SiLU/RMS definitions with the arithmetic. |
| M15.7 | [Match information flow to the learning objective](lessons/transformer-families.yaml) | Revised | Put the masked-sentence example beside bidirectional access; preserved the three information-flow designs. |
| M15.8 | [Follow one token through a transformer](lessons/transformer-trace.yaml) | Revised | Retained the full decoder trace and cost extension; made the final distinction concise. |
| M16.1 | [Choose the model that pretraining will fit](lessons/base-model-design.yaml) | Revised | Retained the explicit interface counts and recipe card; removed an unrelated board-game analogy. |
| M16.2 | [Build a traceable corpus before spending training compute](lessons/pretraining-data-pipeline.yaml) | Revised | Kept the document ledger; replaced forced metaphor and slogan wording with the actual processing steps. |
| M16.3 | [Choose how much the model sees of each source](lessons/training-data-mixtures.yaml) | Revised | Kept the sampling-budget example and distinguished token positions from vocabulary; reduced competing food metaphors. |
| M16.4 | [Assemble token batches without leaking targets](lessons/packing-and-masking.yaml) | Retained | Retained the worked shift, padding, and packed-document trace; the separation of visibility and scoring is clear. |
| M16.5 | [Choose what a pretraining prediction means](lessons/pretraining-objectives.yaml) | Revised | Replaced an anthropomorphic internet-understanding opening with the objective’s actual role. |
| M16.6 | [Inside a language model training step](lessons/training-loop.yaml) | Retained | Retained the clear separation of forward, backward, and optimizer steps, including the stale-gradient example. |
| M16.7 | [Allocate compute and preserve useful checkpoints](lessons/pretraining-budget-and-checkpoints.yaml) | Revised | Introduced FLOPs and utilization within the budget explanation instead of afterward. |
| M16.8 | [Continue pretraining without losing sight of the starting model](lessons/continued-pretraining.yaml) | Revised | Led with the astronomy next-token example and defined forgetting through the before/after comparison. |
| M17.1 | [Why arithmetic counts do not tell the whole speed story](lessons/compute-and-bandwidth.yaml) | Revised | Retained the independent work/transfer bounds; shortened the takeaway to the bottleneck decision. |
| M17.2 | [Account for everything that occupies accelerator memory](lessons/training-memory.yaml) | Revised | Combined the repeated state-budget calculation; retained explicit exclusions and inference contrast. |
| M17.3 | [Train replicas on different examples and combine their gradients](lessons/data-parallel-training.yaml) | Revised | Defined workers and replicas within the synchronized-step explanation. |
| M17.4 | [Split a model across devices in different ways](lessons/model-parallel-training.yaml) | Revised | Combined tensor and pipeline definitions with the two-layer example. |
| M17.5 | [Save memory by sharing state or recreating it](lessons/sharding-and-recomputation.yaml) | Revised | Started sharding with the explicit four-worker storage example; retained activation-checkpoint versus disk-checkpoint distinction. |
| M17.6 | [Spend numerical precision where it is needed](lessons/mixed-precision-training.yaml) | Revised | Merged number-format terminology with the scientific-notation explanation; kept scaling arithmetic and format caveats. |
| M17.7 | [Compute attention with less memory traffic](lessons/efficient-attention-kernels.yaml) | Revised | Retained the running-maximum softmax calculation; removed jargon from the closing point. |
| M17.8 | [Make a large training run recoverable and auditable](lessons/reliable-training-operations.yaml) | Revised | Retained shard recovery, reproducibility definitions, and energy arithmetic; simplified the final instruction. |
| M18.1 | [Give each token a selected route through some parameters](lessons/conditional-computation.yaml) | Revised | Expanded MoE and defined sparse execution before the dense comparison. |
| M18.2 | [Score experts and choose a small set](lessons/routers-and-top-k.yaml) | Retained | Retained the complete score/select/normalize/combine example and the matching playground; all operations are introduced in order. |
| M18.3 | [Follow a token through dispatch, experts, and combination](lessons/expert-dispatch-and-combine.yaml) | Revised | Introduced dispatch with the assignment record before describing grouping and execution. |
| M18.4 | [Count total capacity and active work separately](lessons/moe-parameter-accounting.yaml) | Revised | Retained the explicit total/active/storage calculations; simplified the closing distinction. |
| M18.5 | [Keep expert loads from overwhelming the execution plan](lessons/expert-capacity-and-balance.yaml) | Revised | Integrated auxiliary loss and routing-bias definitions; removed repeated balance instructions. |
| M18.6 | [Separate always-on experts from routed specialists](lessons/shared-and-fine-grained-experts.yaml) | Revised | Defined granularity where the split is introduced; kept the equal-width comparison. |
| M18.7 | [Understand how sparse routes learn and cross device boundaries](lessons/moe-gradients-and-communication.yaml) | Revised | Defined the mixture symbols before tracing derivatives; retained the discrete-selection and communication distinction. |
| M18.8 | [Serve sparse models under real traffic](lessons/serving-expert-models.yaml) | Revised | Replaced ambiguous per-token activation wording; retained the concrete batching and hot-expert cases. |
| M19.1 | [Choose which token pairs may communicate](lessons/attention-patterns.yaml) | Revised | Retained the layer-by-layer three-position window trace; simplified the takeaway. |
| M19.2 | [Reduce the state stored for attention keys and values](lessons/shared-and-latent-kv.yaml) | Revised | Introduced sharing abbreviations once and integrated the latent representation explanation. |
| M19.3 | [Rearrange attention around a compressed running summary](lessons/linear-attention.yaml) | Revised | Retained the scalar summary and connected vector formulation; replaced a dense topic-list takeaway. |
| M19.4 | [Represent a sequence through an evolving hidden state](lessons/state-space-sequences.yaml) | Revised | Defined the recurrence symbols before the formula and linked the time-invariant trace to convolution. |
| M19.5 | [Let the current input control what the state retains](lessons/selective-state-spaces.yaml) | Revised | Retained the gate-like numerical example and scan explanation; made the retained-versus-compressed tradeoff direct. |
| M19.6 | [Combine attention, recurrence, and convolution deliberately](lessons/hybrid-sequence-architectures.yaml) | Revised | Retained serial/parallel diagrams and the explicit 2KT + 6R state calculation. |
| M19.7 | [Can the model use a long prompt?](lessons/long-context-capability.yaml) | Revised | Removed duplicate effective-context definitions; led with the accepted-prompt versus usable-evidence example. |
| M19.8 | [Compare sequence architectures with an honest budget](lessons/architecture-tradeoff-study.yaml) | Revised | Retained the explicit 8 GB comparison and separate phase definitions; removed an awkward claim of greater evidence strength. |
| M20.1 | [Track what each adaptation stage changes](lessons/posttraining-stages.yaml) | Revised | Replaced forced memory cue with a practical checkpoint comparison. |
| M20.2 | [Learn response behavior from demonstrations](lessons/supervised-fine-tuning.yaml) | Revised | Kept the library example and response-loss calculation; removed a forced slogan. |
| M20.3 | [Adapt a model by learning a smaller parameter update](lessons/low-rank-adaptation.yaml) | Revised | Defined LoRA and quantization before their mechanics and integrated duplicate explanations. |
| M20.4 | [Learn a scoring signal from response comparisons](lessons/preferences-and-reward-models.yaml) | Revised | Connected rubric, pairwise score and sigmoid to one concrete comparison. |
| M20.5 | [Learn from feedback while controlling policy changes](lessons/rlhf-and-kl-control.yaml) | Revised | Introduced RLHF and rollout before use; separated PPO clipping from reference-model KL without repetition. |
| M20.6 | [Train on preference pairs without a separate online reward loop](lessons/direct-preference-optimization.yaml) | Revised | Defined DPO and its reference before the likelihood comparison; simplified takeaway. |
| M20.7 | [Transfer behavior through teacher outputs and selected examples](lessons/distillation-and-selection.yaml) | Revised | Brought teacher/student and soft targets into the opening explanation. |
| M20.8 | [Measure adaptation gains without overlooking regressions](lessons/posttraining-evaluation.yaml) | Revised | Used a concrete target to introduce regressions and clarified what win rates measure. |
| M21.1 | [Separate a correct solution from a convincing explanation](lessons/reasoning-and-explanations.yaml) | Revised | Defined three kinds of evidence before discussing causal tests. |
| M21.2 | [Teach a useful starting style for problem solving](lessons/reasoning-demonstrations.yaml) | Revised | Integrated trace definition and pencil example; removed repeated cold-start definition and unrelated aside. |
| M21.3 | [Turn checkable outcomes into a learning signal](lessons/verifiable-rewards.yaml) | Revised | Introduced verifier at first use and kept the numerical equivalence and coverage examples. |
| M21.4 | [Compare several sampled solutions to form a baseline](lessons/group-relative-policy-learning.yaml) | Revised | Introduced acronym before mechanism and separated the three policy roles. |
| M21.5 | [Choose whether to score the result, the steps, or both](lessons/process-and-outcome-rewards.yaml) | Revised | Kept strong cancellation counterexample and shortened the takeaway. |
| M21.6 | [Spend extra generation on candidates, checks, and search](lessons/inference-time-search.yaml) | Revised | Combined duplicated definitions of self-consistency and best-of-n. |
| M21.7 | [Use tools to check work within an explicit stopping policy](lessons/reasoning-with-tools-and-budgets.yaml) | Revised | Retained clear unit-conversion and stopping-policy examples; simplified takeaway. |
| M21.8 | [Transfer reasoning behavior and compare its operating cost](lessons/reasoning-distillation-and-cost.yaml) | Revised | Retained concrete selection and latency examples; simplified takeaway. |
| M22.1 | [Predicting a label, generating a possibility](lessons/generative-models.yaml) | Revised | Integrated definitions of condition, sample, fidelity and coverage into the examples. |
| M22.2 | [Generate different kinds of data one unit at a time](lessons/autoregressive-modalities.yaml) | Revised | Retained chain-rule and representation examples; simplified takeaway. |
| M22.3 | [Learn a latent representation and a way back to data](lessons/autoencoders-and-vaes.yaml) | Revised | Defined encoder, decoder, posterior and ELBO in the order needed; retained the reparameterization calculation. |
| M22.4 | [Train a generator against a learned discriminator](lessons/generative-adversarial-learning.yaml) | Revised | Introduced GAN and the two networks together; retained alternating-gradient and mode-collapse explanations. |
| M22.5 | [Represent probability through invertible maps or energy scores](lessons/flows-and-energy-models.yaml) | Revised | Kept the recently improved density and two-state scaffolding; simplified summary and takeaway. |
| M22.6 | [How an image can emerge from noise](lessons/denoising.yaml) | Revised | Removed curricular bookkeeping and defined the score before its notation-heavy discussion. |
| M22.7 | [Why image generators work in latent space](lessons/latent-diffusion.yaml) | Revised | Removed syllabus-like closing language while preserving the architecture/objective distinction and guidance arithmetic. |
| M22.8 | [Learn a velocity field and integrate it into samples](lessons/flow-matching-and-solvers.yaml) | Revised | Defined ODE and integrated the Euler calculation before discussing solver tradeoffs. |
| M23.1 | [Connect information expressed in different forms](lessons/multimodal-alignment-and-fusion.yaml) | Revised | Kept animal-score and timing examples; made the closing distinction easier to remember. |
| M23.2 | [Bring matching images and descriptions closer in representation space](lessons/contrastive-image-text-learning.yaml) | Revised | Used one two-pair example throughout the similarity explanation. |
| M23.3 | [Connect a vision encoder to a language model](lessons/vision-language-interfaces.yaml) | Revised | Introduced encoder and projector where first needed; removed repeated definitions on the next scene. |
| M23.4 | [Turn images, sound, and video into manageable model inputs](lessons/modality-tokenization.yaml) | Revised | Kept patch and codec arithmetic; shortened closing explanation. |
| M23.5 | [Train alignment, generation, and instruction behavior across modalities](lessons/multimodal-training-lifecycle.yaml) | Revised | Kept staged apple example and training distinctions; simplified takeaway. |
| M23.6 | [Model motion and persistence across frames](lessons/video-models.yaml) | Revised | Kept frame-count example and identity continuity; simplified takeaway. |
| M23.7 | [Predict what may happen next, with or without actions](lessons/world-models-and-predictive-representations.yaml) | Revised | Defined joint-embedding prediction and representation collapse in plain language. |
| M23.8 | [Check whether answers actually follow the supplied media](lessons/multimodal-grounding-evaluation.yaml) | Revised | Kept chart arithmetic and minimal contrasts; replaced ablation jargon in takeaway. |
| M24.1 | [Learn decisions from consequences over time](lessons/reinforcement-learning-loop.yaml) | Revised | Led with maze example and introduced interaction vocabulary before abstract state distinction. |
| M24.2 | [Choose between known rewards and learning about alternatives](lessons/bandits-and-exploration.yaml) | Revised | Defined arm at its first appearance and kept epsilon-greedy arithmetic. |
| M24.3 | [Relate the value of a state to its next step](lessons/mdps-and-bellman-equations.yaml) | Revised | Expanded MDP before its assumption and clarified the two value calculations. |
| M24.4 | [Update values from sampled transitions](lessons/temporal-difference-and-q-learning.yaml) | Revised | Defined Q before the update and integrated on/off-policy comparison with arithmetic. |
| M24.5 | [Approximate action values with a neural network](lessons/deep-q-networks.yaml) | Revised | Expanded DQN and retained target-network worked example. |
| M24.6 | [Learn a policy directly from its outcomes](lessons/policy-gradients-and-actor-critic.yaml) | Revised | Kept advantage arithmetic and appropriate local-update caveat; simplified takeaway. |
| M24.7 | [Plan with learned dynamics when the full state is hidden](lessons/model-based-and-partially-observed-rl.yaml) | Revised | Kept the hidden-door belief example and replanning explanation; shortened takeaway. |
| M24.8 | [Learn from recorded decisions without assuming safe exploration](lessons/offline-rl-and-imitation.yaml) | Revised | Kept DAgger distinction and curb example; simplified takeaway. |
| M25.1 | [Decide where a system follows a workflow and where it chooses actions](lessons/agents-and-workflows.yaml) | Revised | Retained clear thermostat and record-comparison examples; simplified takeaway. |
| M25.2 | [Give tools clear inputs, results, and state](lessons/tool-contracts-and-state.yaml) | Revised | Kept note-creation timeout and idempotency example; simplified title and takeaway. |
| M25.3 | [Turn a plan into checked execution with recovery paths](lessons/agent-planning-and-recovery.yaml) | Revised | Moved recovery definitions into the explanation before their implications. |
| M25.4 | [Decide what to retain and what to show the model now](lessons/agent-memory-and-context.yaml) | Revised | Kept concrete meeting-update example and storage distinctions; simplified takeaway. |
| M25.5 | [Coordinate several decision-makers without assuming independent judgment](lessons/multi-agent-coordination.yaml) | Revised | Retained clear coordination timing example and shared-error limitations. |
| M25.6 | [Learn when other decision-makers are learning too](lessons/multi-agent-learning-and-games.yaml) | Revised | Integrated the centralized/decentralized explanation where introduced and removed repetition. |
| M25.7 | [Keep the authority to act outside retrieved content](lessons/agent-permissions-and-untrusted-input.yaml) | Revised | Retained well-sequenced concrete trust-boundary explanation; shortened takeaway. |
| M25.8 | [Evaluate the completed task and the trajectory that produced it](lessons/agent-evaluation.yaml) | Revised | Kept the cost calculation and small-sample caveat; simplified takeaway. |
| M26.1 | [Find documents through an index of their words](lessons/lexical-information-retrieval.yaml) | Revised | Expanded ranking acronyms before discussing their effects. |
| M26.2 | [Search learned representations with approximate neighbors](lessons/dense-vector-retrieval.yaml) | Revised | Defined dual encoder at first use and kept the neighbor-recall example. |
| M26.3 | [Prepare retrievable evidence without losing its context](lessons/retrieval-ingestion-and-chunking.yaml) | Revised | Integrated chunk definition and qualification example before discussing tradeoffs. |
| M26.4 | [Improve candidate retrieval and rank the useful evidence](lessons/hybrid-search-and-reranking.yaml) | Revised | Retained concrete rank-fusion arithmetic and stage distinctions. |
| M26.5 | [Retrieve evidence and condition an answer on it](lessons/rag-evidence-pipeline.yaml) | Revised | Expanded RAG before use and removed duplicate later definition. |
| M26.6 | [Check whether a source supports the claim beside it](lessons/citations-and-evidence-fidelity.yaml) | Revised | Retained support-versus-coverage worked example and qualification contrast. |
| M26.7 | [Choose how information should reach the model](lessons/retrieval-context-and-fine-tuning.yaml) | Revised | Retained changing-handbook example and mechanism comparison. |
| M26.8 | [Keep retrieved evidence current, permitted, and resistant to manipulation](lessons/retrieval-boundaries-and-failures.yaml) | Revised | Retained distinct poisoning and injection definitions; simplified takeaway. |
| M27.1 | [Load a compatible model and prepare its exact input](lessons/inference-request-preparation.yaml) | Revised | Moved artifact definition to opening and left token-budget calculation focused. |
| M27.2 | [From a prompt to a stream of tokens](lessons/cached-inference.yaml) | Revised | Retained coherent prefill/decode sequence and cache-byte calculation; shortened closing wording. |
| M27.3 | [Turn logits into a controlled generation procedure](lessons/decoding-and-sampling.yaml) | Revised | Corrected control instruction: moving a draw need not select a different interval. |
| M27.4 | [Schedule many requests around shared hardware](lessons/batching-streaming-and-cache-management.yaml) | Revised | Retained block-allocation example and separate latency measures. |
| M27.5 | [Reduce deployment cost while measuring what changes](lessons/quantization-pruning-and-compression.yaml) | Revised | Retained numerical quantization/clipping example and hardware qualification. |
| M27.6 | [Let a cheap draft propose tokens for a target model to verify](lessons/speculative-decoding.yaml) | Revised | Kept complete acceptance/correction example; simplified takeaway without losing exactness condition. |
| M27.7 | [Place model computation where memory and latency allow it](lessons/distributed-and-edge-serving.yaml) | Revised | Retained concrete 12 GB placement example; simplified takeaway. |
| M27.8 | [Choose a deployment using quality and workload evidence](lessons/serving-metrics-and-cost.yaml) | Revised | Placed first-token arithmetic with latency and retained separate cost-per-completion example. |
| M28.1 | [Measure the behavior that the task actually needs](lessons/evaluation-metrics-and-uncertainty.yaml) | Revised | Retained representative-sample arithmetic and calibration distinction. |
| M28.2 | [Build a test whose score supports the intended claim](lessons/benchmark-design-and-comparison.yaml) | Revised | Removed forced mnemonic and distracting shopping metaphor; retained concrete library benchmark. |
| M28.3 | [Treat evaluators as fallible measurement instruments](lessons/human-and-model-judges.yaml) | Revised | Removed forced memory phrase while retaining practical judge controls. |
| M28.4 | [Find failures hidden by an overall score](lessons/robustness-and-slice-testing.yaml) | Revised | Defined slice at first use and kept the noisy-recording example. |
| M28.5 | [Evaluate claims against evidence and recognize missing information](lessons/factuality-and-abstention.yaml) | Revised | Retained clear accuracy-coverage arithmetic and evidence distinctions. |
| M28.6 | [Ask what an explanation method actually measures](lessons/attribution-and-counterfactual-explanations.yaml) | Revised | Kept complete baseline-dependent integrated-gradients example and real-world causality distinction. |
| M28.7 | [Test hypotheses about internal representations and computation](lessons/mechanistic-interpretability.yaml) | Revised | Retained concrete red/blue patching example and scope of causal claims. |
| M28.8 | [Make conclusions match the strength of the experiment](lessons/causal-evaluation-and-negative-results.yaml) | Revised | Kept confounded attention/data comparison and negative-result explanation. |
| M29.1 | [Decide whose problem the system solves and who bears its errors](lessons/stakeholders-and-deployment-decisions.yaml) | Revised | Kept scheduling example and meaningful human-review conditions; shortened takeaway. |
| M29.2 | [Choose fairness measurements that match the decision context](lessons/fairness-definitions-and-tradeoffs.yaml) | Revised | Kept explicit denominators and metric incompatibility qualification; simplified takeaway. |
| M29.3 | [Understand what training and deployment can reveal about data](lessons/privacy-and-memorization.yaml) | Revised | Integrated differential-privacy definitions and expanded DP-SGD before use. |
| M29.4 | [Distinguish manipulated inputs, training data, and model artifacts](lessons/adversarial-and-supply-chain-risks.yaml) | Revised | Moved attacker-access definitions to input-attack explanation instead of leaving them after file hashes. |
| M29.5 | [Protect tools and sensitive data around the model](lessons/application-security-boundaries.yaml) | Revised | Retained concrete note-renaming example and use-site validation distinctions. |
| M29.6 | [Align measured behavior with intended human constraints](lessons/alignment-and-oversight.yaml) | Revised | Kept concrete helpful-button proxy example and limits of oversight approaches. |
| M29.7 | [Assess labor, access, resources, and accountability across the lifecycle](lessons/ai-and-society.yaml) | Revised | Retained task/job distinction and energy calculation; simplified takeaway. |
| M29.8 | [Discuss broad intelligence and experience without overstating evidence](lessons/agi-consciousness-and-uncertainty.yaml) | Revised | Expanded AGI before use and integrated examples instead of repeating definition. |
| M30.1 | [Connect measurements and actions to a physical body](lessons/robot-sensors-and-frames.yaml) | Revised | Moved torque and joint-position definitions to first use; kept calibration example focused. |
| M30.2 | [Correct motion using measured error](lessons/feedback-and-robot-control.yaml) | Revised | Expanded PID before its terms and introduced plant before tuning discussion. |
| M30.3 | [Estimate where the robot is while learning the map](lessons/localization-mapping-and-slam.yaml) | Revised | Defined pose and SLAM before use and removed repeated delayed definition. |
| M30.4 | [Turn a desired pose into feasible movement](lessons/kinematics-and-motion-planning.yaml) | Revised | Introduced end effector before kinematics and kept one-link arm example. |
| M30.5 | [Learn physical actions from demonstrations](lessons/robot-imitation-learning.yaml) | Revised | Defined demonstration-collection methods when introduced instead of after action averaging. |
| M30.6 | [Learn in simulation and test what transfers](lessons/robot-rl-and-sim-to-real.yaml) | Revised | Retained concrete collision-reward and friction examples. |
| M30.7 | [Connect visual instructions to a robot’s action interface](lessons/vision-language-action-models.yaml) | Revised | Expanded VLA at first appearance, preserving action-bin calculation. |
| M30.8 | [Evaluate closed-loop behavior under physical uncertainty](lessons/physical-ai-evaluation.yaml) | Revised | Moved stale-state arithmetic to timing scene and kept assistance arithmetic with assistance. |
| M31.1 | [Ask what would change if an action changed the world](lessons/causal-graphs-and-interventions.yaml) | Revised | Introduced confounding at first use and organized adjustment examples around variable roles. |
| M31.2 | [State the assumptions behind effects that cannot all be observed](lessons/counterfactuals-and-identification.yaml) | Revised | Clarified participation versus offer and defined identification terms before worked comparison. |
| M31.3 | [Reuse learning when the next task or domain changes](lessons/transfer-and-domain-adaptation.yaml) | Revised | Kept warehouse and negative-transfer examples; simplified takeaway. |
| M31.4 | [Distinguish examples in a prompt from learning to adapt weights](lessons/few-shot-meta-and-in-context-learning.yaml) | Revised | Kept support/query line-fitting example and no-weight-update distinction. |
| M31.5 | [Learn new information while measuring what is forgotten](lessons/continual-and-online-learning.yaml) | Revised | Kept percentage-point forgetting example and retention strategies. |
| M31.6 | [Choose which examples to learn from next](lessons/active-and-curriculum-learning.yaml) | Revised | Kept concrete ten-label budget and independent-evaluation warning. |
| M31.7 | [Use unlabeled data and imperfect label sources carefully](lessons/semi-supervised-and-weak-learning.yaml) | Revised | Kept explicit pseudo-label and rule-based distinction with concrete message example. |
| M31.8 | [Coordinate learning while data remain distributed](lessons/federated-and-decentralized-learning.yaml) | Revised | Kept record-weighted versus client-weighted arithmetic and privacy distinctions. |
| M32.1 | [Search with a population of varied candidates](lessons/evolutionary-search.yaml) | Revised | Kept explicit bit mutation and recombination examples. |
| M32.2 | [Evolve programs, weights, or architectures](lessons/genetic-programming-and-neuroevolution.yaml) | Revised | Kept expression-tree arithmetic and complete search-cost example. |
| M32.3 | [Coordinate simple searchers through shared signals](lessons/swarm-optimization.yaml) | Revised | Moved ant evaporation arithmetic from particle movement to the ant-colony scene. |
| M32.4 | [Represent graded membership without confusing it with probability](lessons/fuzzy-sets-and-control.yaml) | Revised | Retained membership/probability distinction and concrete rule-combination calculations. |
| M32.5 | [Reuse past cases and combine explicit knowledge with learned predictions](lessons/case-based-and-hybrid-decisions.yaml) | Revised | Retained clear retrieve/adapt/verify flow and concrete repair example. |
| M32.6 | [Connect learned representations with explicit reasoning constraints](lessons/neuro-symbolic-learning.yaml) | Revised | Retained child/parent probability penalty and distinction from hard guarantees. |
| M32.7 | [Choose expensive experiments using a surrogate model](lessons/bayesian-optimization-and-automl.yaml) | Revised | Defined surrogate at first use and moved AutoML expansion to pipeline discussion. |
| M32.8 | [Choose a search or hybrid method for the constraints you have](lessons/comparing-search-and-hybrid-methods.yaml) | Revised | Retained concrete six-evaluation budget and scoped method comparisons. |
| M33.1 | [Choose a useful problem before choosing a model](lessons/ai-product-framing.yaml) | Revised | Removed forced mnemonic and made comparison heading direct while retaining library pilot example. |
| M33.2 | [Keep training and serving connected to the same definitions](lessons/production-data-and-model-artifacts.yaml) | Revised | Removed unrelated lunchbox metaphor and forced mnemonic; retained useful matching-pieces analogy. |
| M33.3 | [Release changes with evidence and a recovery path](lessons/evaluation-releases-and-rollback.yaml) | Revised | Made release headings concrete and removed forced mnemonic. |
| M33.4 | [Notice when the production task changes](lessons/monitoring-drift-and-retraining.yaml) | Revised | Removed detective framing and forced mnemonic; retained evidence-driven diagnosis sequence. |
| M33.5 | [Build a reliable request path around local or remote inference](lessons/ai-service-boundaries.yaml) | Revised | Introduced API near the first request boundary and integrated queue/backpressure definitions. |
| M33.6 | [Give people useful control over model-assisted work](lessons/human-review-and-user-experience.yaml) | Revised | Removed forced memory slogan while preserving concrete review-desk examples. |
| M33.7 | [Plan for traffic, failures, and ongoing resource use](lessons/operational-capacity-and-reliability.yaml) | Revised | Moved graceful-degradation definition to the relevant scene and kept queue arithmetic focused. |
| M33.8 | [Apply the same lifecycle questions to different products](lessons/applied-ai-case-comparisons.yaml) | Revised | Retained readable cross-product comparison and concrete meaning of success. |
| M34.1 | [Learn by exchanging messages across a graph](lessons/graph-neural-networks.yaml) | Revised | Explained permutation behavior beside aggregation and removed duplicate depth explanation. |
| M34.2 | [Build symmetry into predictions about geometry](lessons/equivariant-scientific-learning.yaml) | Revised | Retained concrete rotated-force and unchanged-energy example. |
| M34.3 | [Learn functions while using equations or families of solutions](lessons/physics-informed-models-and-operators.yaml) | Revised | Defined function notation at first use; retained zero-residual counterexample. |
| M34.4 | [Evaluate scientific predictions beyond familiar benchmarks](lessons/biological-and-molecular-modeling.yaml) | Revised | Kept sequence/structure definitions and novelty-based split explanation. |
| M34.5 | [Match event-driven computation to a scientific workload](lessons/neuromorphic-scientific-applications.yaml) | Revised | Replaced syllabus reference with a concrete description of the mechanism to inspect. Final consistency cleanup. |
| M34.6 | [Use models to propose experiments and test hypotheses](lessons/ai-assisted-discovery.yaml) | Revised | Retained clear two-hypothesis experiment and proposal/confirmation distinction. |
| M34.7 | [Evaluate new computing and learning claims without assuming a breakthrough](lessons/emerging-architecture-evidence.yaml) | Revised | Kept concrete quantum access and measurement limitations; shortened takeaway. |
| M34.8 | [Maintain a research record that can change with evidence](lessons/following-the-research-frontier.yaml) | Revised | Retained versioned-paper example and comparison-budget caution. |
| M35.1 | [Read a model release as an inspectable set of artifacts](lessons/model-report-and-artifact-inventory.yaml) | Revised | Retained dated-artifact inventory and terms distinctions; simplified takeaway. |
| M35.2 | [Trace the Llama 3.1 dense decoder lifecycle](lessons/llama-three-case-study.yaml) | Revised | Moved annealing definition to pretraining and integrated post-training refresher without duplication; retained pinned report claims. |
| M35.3 | [Compare Qwen3 dense and MoE models with reasoning modes](lessons/qwen-three-case-study.yaml) | Revised | Integrated overlapping pretraining/post-training summaries while retaining all pinned stage and token-count claims. |
| M35.4 | [Trace DeepSeek-V3 from sparse architecture to distributed serving](lessons/deepseek-v3-case-study.yaml) | Revised | Expanded MLA before mechanics and organized architecture pieces by their role; retained reported counts. |
| M35.5 | [Separate DeepSeek-R1, R1-Zero, and distilled students](lessons/deepseek-r1-case-study.yaml) | Revised | Retained distinct base, R1-Zero, staged R1 and student lineage examples. |
| M35.6 | [Inspect the Olmo 3 model flow](lessons/olmo-three-case-study.yaml) | Revised | Integrated repeated midtraining explanation with the base-training flow; retained dated report and branch distinctions. |
| M35.7 | [Compare language, image, audio, and state-space artifacts](lessons/cross-modal-model-case-comparison.yaml) | Revised | Defined request state at the comparison-sheet introduction rather than at the end. |
| M35.8 | [Read proprietary reports without inventing hidden architecture](lessons/proprietary-model-evidence-boundaries.yaml) | Revised | Retained explicit historical disclosures and known/unknown distinction. |
| M36.1 | [Project: explain AI through a historical concept map](lessons/history-and-concept-map-project.yaml) | Revised | Kept specific deliverable, worked edges and self-review rubric; simplified takeaway. |
| M36.2 | [Project: compare a baseline with a learned predictor](lessons/classical-prediction-project.yaml) | Revised | Made local project hand-in wording unambiguous; retained full split and error calculations. |
| M36.3 | [Project: trace a tiny network and one gradient update](lessons/small-network-gradient-project.yaml) | Revised | Retained fully specified differentiable example and simultaneous updates; shortened takeaway. |
| M36.4 | [Project: build a tiny next-token model and checkpoint ledger](lessons/tiny-language-model-project.yaml) | Revised | Made validation role clear before checkpoint selection and broke dense instructions into a usable sequence. |
| M36.5 | [Project: compare dense and sparse model lifecycles](lessons/dense-and-moe-comparison-project.yaml) | Revised | Kept source-based artifact task and synthetic memory worksheet; simplified takeaway. |
| M36.6 | [Project: trace a grounded answer and a controlled tool action](lessons/retrieval-and-tool-workflow-project.yaml) | Revised | Kept complete fictional knowledge base, missing-evidence case and nonexecuting action test. |
| M36.7 | [Project: reproduce a result and audit an ablation](lessons/ablation-and-reproduction-project.yaml) | Revised | Defined ablation and log-loss unit before calculation; preserved deterministic toy and stress-test distinction. |
| M36.8 | [Final project: defend an end-to-end AI system design](lessons/architecture-defense-project.yaml) | Revised | Kept concrete briefs, required cases and human-review limit; simplified takeaway. |
| M36.9 | [Project: specify and test a conditional image generator](lessons/image-generation-project.yaml) | Revised | Broke sampler procedure into readable steps without changing its fixture or probabilities. |
| M36.10 | [Project: trace and evaluate a tiny video generator](lessons/video-generation-project.yaml) | Revised | Kept storyboard, unit calculations and temporal counterexamples; clarified review is local. |
| M36.11 | [Project: trace a speech and audio system](lessons/speech-audio-project.yaml) | Revised | Kept aligned WER arithmetic and stage-specific rubrics; made hand-in language match local workflow. Final consistency cleanup. |
| M36.12 | [Project: trace a robot sensing and control loop](lessons/robotics-system-project.yaml) | Revised | Kept explicit state/observation calculation and learned-policy alternatives; clarified local review. Final consistency cleanup. |
| M37.1 | [Update connections from local activity](lessons/hebbian-and-local-learning.yaml) | Revised | Moved connection-side vocabulary to the opening mechanism. |
| M37.2 | [Recover patterns through energy-based state dynamics](lessons/associative-memory-and-boltzmann-models.yaml) | Revised | Defined asynchronous updating at first use; kept complete two-unit energy trace. |
| M37.3 | [Learn a dictionary or a neighborhood-organized representation](lessons/sparse-coding-and-self-organizing-maps.yaml) | Revised | Moved map update arithmetic beside map explanation and defined dictionary before advanced comparison. |
| M37.4 | [Follow voltage, leakage, threshold, and reset](lessons/integrate-and-fire-neurons.yaml) | Revised | Integrated repeated vocabulary explanation into one ordered introduction; retained exact toy update. |
| M37.5 | [Learn with spike timing or an approximate backward signal](lessons/spike-timing-and-surrogate-gradients.yaml) | Revised | Expanded STDP and plasticity before describing timing rule. |
| M37.6 | [Use fixed recurrent dynamics and train a readout](lessons/reservoir-computing.yaml) | Revised | Retained explicit fixed-state recurrence, trained readout and fading-memory example. |
| M37.7 | [Learn a vector field and let a solver define continuous depth](lessons/neural-ordinary-differential-equations.yaml) | Revised | Defined ODE and symbols before the equation; integrated repeated Euler explanation. |
| M37.8 | [Compare learning rules, state dynamics, and hardware evidence](lessons/comparing-alternative-neural-models.yaml) | Revised | Kept explicit state-versus-parameter comparison across methods; simplified takeaway. |
