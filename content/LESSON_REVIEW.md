# Lesson editorial review — September 20, 2026

**335 of 335 authored lessons received an individual reading pass.** This includes all 311 module lessons, 23 math/programming bridges, and the A01 expert-model preview. 272 lessons received teaching, summary, feedback, source, or side-lesson changes during this pass; the remaining explanations were retained after reading. This is an editorial milestone. Publication state remains `draft`.

A subsequent [learning-experience follow-up](REVIEW_FOLLOWUP.md) revises fourteen of these assets with additional practice, three visual experiments, and teaching corrections. The snapshot below records the earlier pass, before those follow-up edits.

## What was examined

The pass read every routed teaching explanation, including optional mathematics where present, with the lesson summary, worked examples, tables/figure descriptions, visible formative prompts, closing takeaway, and source list. The notes below identify the specific review decision for each lesson. This pass was performed by the implementation assistant; it is not an independent human subject review or a learner study.

The changes favor plain invitations and concrete examples over unexplained terminology. They include mathematical steps, comparisons with explicit assumptions, and links to math preparation at newly expanded calculations. Existing lesson IDs, route IDs, scene aliases, objective versions, active question IDs, and answer contracts remain stable. Explanatory feedback corrections do not silently upgrade a learner’s prior evidence to cover additional skills.

Not every external link was freshly checked. Named model reports were rechecked at their cited revisions; added historical, tokenizer, and speech references identify primary sources. The generated editorial report continues to flag generic reading destinations. Not every one of the 1,628 active assessment variants was independently revalidated: systematic bank review and stronger fresh retakes remain release work.

## Corrections and teaching improvements

- Corrected squared bias in the bias–variance explanation, the fixed-direction assumption in a threshold-classifier capacity example, the cost convention in an inspection decision, and signed decay toward zero.
- Made repeated token positions distinct from vocabulary types, and sampling with replacement explicit before describing independent bag draws.
- Explained previously introduced unigram tokenization, CTC collapse order, local/adjoint derivatives, Q-learning versus SARSA, and speculative sampling acceptance/correction through inspectable examples.
- Added concrete steps across logic, search, probability, neural learning, architectures, training, multimodality, RL, agents, retrieval, serving, robotics, scientific AI, and alternative neural methods.
- Extended model case studies with documented training stages, architecture distinctions, and explicitly bounded cache/weight calculations.
- Clarified the validation role of checkpoint-selection observations and the fact that printed project test rows are reserved by protocol, rather than hidden by the application.
- Removed option-position references from misleading feedback, kept the advanced preview’s practice-only status consistent, and preserved indentation and keyboard scrolling in the runnable Python teaching example.

## What “complete” means

A release decision requires evidence for all six requirements in [the authoring standards](AUTHORING.md#when-a-lesson-leaves-draft): scoped preparation, a teachable explanation, independently checked accuracy, aligned assessment, accessible usable delivery, and learner trials. Completion applies to a stated outcome; it does not mean a lesson exhausts its entire research field. No word count or automated score substitutes for these checks.

| Milestone | Status after this pass |
| --- | --- |
| Individual editorial reading | Completed for the 335 listed assets; findings recorded below |
| Explanatory revisions | Applied where recorded; further revision remains possible |
| Source coverage | Targeted primary-report checks completed; generic destinations still flagged |
| Full assessment-bank validation | Pending; feedback fixes and automated contract checks are narrower evidence |
| Independent subject review | Pending; not supplied by the author’s own pass |
| Beginner learning trials | Pending; understanding and engagement have not been inferred from word counts |
| Accessibility and browser validation | Automated/local checks recorded in README; manual and cross-browser work remains |
| Publication readiness | Draft; no lesson promoted solely on the basis of this pass |

## Lesson-by-lesson record

“Revised” means this pass changed the asset; “retained” means the explanation was read and kept. Neither word asserts independent validation. The adjacent [snapshot](LESSON_REVIEW_SNAPSHOT.json) records the exact file hash for each row. Later edits require revisiting the affected note; the record is dated, not a live completion badge.

| Slot | Lesson | Editorial decision | Finding |
| --- | --- | --- | --- |
| A01 | [Follow a token through a mixture of experts](lessons/experts.yaml) | Revised | Expanded MoE/router vocabulary and all intermediate top-two arithmetic; retained scoped preview. |
| B01 | [The numbers you actually need](lessons/arithmetic.yaml) | Revised | Corrected ambiguous “equal signs” to matching positive/negative signs; verified signed squared-error examples. |
| B02 | [Read an equation one symbol at a time](lessons/algebra-notation.yaml) | Retained | Verified substitution, indices/sigma, equality versus assignment, and equation solving. |
| B03 | [A function is a rule](lessons/functions.yaml) | Retained | Retained one-output rule, notation, table/graph, slope, and fixed-weight versus changed-input distinction. |
| B04 | [Powers and logarithms, one step at a time](lessons/powers-logs.yaml) | Retained | Verified exp/log inversion and normalized 4/7,2/7,1/7; retained stable common-offset calculation. |
| B05 | [Sets, graphs, and counting possibilities](lessons/discrete-math.yaml) | Revised | Added explicit union/intersection and order-sensitive counting examples. |
| B06 | [Vectors: lists that work together](lessons/vectors.yaml) | Retained | Verified signed dot product −5, basket16, and weighted vector [3,2]; retained scalar/vector distinction. |
| B07 | [Follow shapes through a numerical layer](lessons/matrices-tensors.yaml) | Retained | Verified full matrix product plus bias [[8,3],[12,0]], axes, transpose, and rank terminology. |
| B08 | [Directions, eigenvectors, and low-rank structure](lessons/linear-algebra-depth.yaml) | Revised | Added norm/projection and explained rank, orthogonality, and SVD approximation concretely. |
| B09 | [Probability without the mystery](lessons/probability.yaml) | Revised | Made replacement explicit for independent bag draws; verified normalization and conditional 2/5. |
| B10 | [Averages over uncertain outcomes](lessons/random-variables.yaml) | Revised | Unpacked variance arithmetic, covariance, and common distributions. |
| B11 | [What can a small experiment tell us?](lessons/statistics-evidence.yaml) | Revised | Rewrote abstract statistics bridge around explicit estimates, interval procedures, bootstrap samples, p-values, and multiplicity. |
| B12 | [A derivative is a local change](lessons/derivatives.yaml) | Retained | Verified finite differences, limiting derivative, negative slope, and 1.4 gradient step. |
| B13 | [Several inputs, several rates of change](lessons/multivariable-calculus.yaml) | Revised | Clarified gradient approximation and Jacobian columns through small changes. |
| B14 | [The chain rule, one step at a time](lessons/chain-rule.yaml) | Retained | Verified composite derivative36, finite-step increase.3609, weight derivative−16/update2.6/loss.64, and branching cancellation. |
| B15 | [Add up a continuous quantity](lessons/integrals-density.yaml) | Revised | Connected accumulation to derivatives and worked density greater than one. |
| B16 | [Choose a direction and a step size](lessons/optimization-math.yaml) | Revised | Defined curvature/convexity/projection with inspectable examples. |
| B17 | [Measure surprise and compare distributions](lessons/information-theory.yaml) | Revised | Added full entropy/cross-entropy/KL calculation and mutual-information example. |
| B18 | [When the computer cannot store the exact number](lessons/numerical-computing.yaml) | Revised | Defined significand/range failures and numerical tolerance before diagnostics. |
| B19 | [Follow a changing state through time](lessons/dynamics-and-noise.yaml) | Revised | Corrected signed decay interpretation and worked drift/noise scaling. |
| B20 | [Value a choice and its later consequences](lessons/decisions-and-games.yaml) | Revised | Added explicit coordination payoffs and defined unilateral deviation. |
| B21 | [Count work, memory, and parallel limits](lessons/algorithm-cost.yaml) | Revised | Added exact comparison count, constant working storage, and log/doubling intuition. |
| B22 | [Make a small experiment repeatable](lessons/python-experiments.yaml) | Revised | Provided a complete dependency-free Python fixture and explained its syntax. |
| B23 | [Distances, neighborhoods, and transformations](lessons/geometry-and-symmetry.yaml) | Revised | Made neighborhood topology, manifold coordinates, and transformation definitions concrete. |
| M00.1 | [What is AI? Start with an everyday task](lessons/ai-systems.yaml) | Revised | Retained concrete button task and first-use definitions; corrected learning wording so adjustment does not imply guaranteed improvement. |
| M00.2 | [Inputs and outputs: what goes in and what comes out](lessons/inputs-and-outputs.yaml) | Retained | Retained picture/program/output trace, changed-task contrast, and action distinction. |
| M00.3 | [Data and examples: what a computer can learn from](lessons/data-and-examples.yaml) | Retained | Retained recorded-information, example-boundary, label/target, and label-error explanations. |
| M00.4 | [What is a model? A small rule inside a bigger app](lessons/models-and-products.yaml) | Revised | Retained crackers model, prediction-versus-future distinction, and whole-app failure trace. |
| M00.5 | [Weights: the adjustable numbers in a model](lessons/weights-and-predictions.yaml) | Retained | Verified input/weight comparison and 6/9 cracker calculations; retained negative/fractional caveat. |
| M00.6 | [Training and inference: changing a rule or using it](lessons/training-and-inference.yaml) | Retained | Verified weight selection, absolute-error intuition, and 15-cracker inference; retained context distinction. |
| M00.7 | [Follow one small AI system from start to finish](lessons/inside-a-system.yaml) | Retained | Verified distance/time units and 3-minute held-out error; retained full lifecycle example. |
| M00.8 | [Different ways to solve the same problem](lessons/ai-traditions.yaml) | Retained | Retained truck-height rule, two-route search, learned travel times, and hybrid trace. |
| M00.9 | [How to tell whether an AI answer is useful](lessons/thinking-critically.yaml) | Revised | Retained 90%-baseline counterexample, separate false alarms, and missing-price abstention. |
| M00.10 | [How to use this school without getting lost](lessons/learning-routes.yaml) | Retained | Reviewed explanation of shared prerequisites, optional bridges, return navigation, and reading modes. |
| M00.11 | [Practice, progress, and knowing what you understand](lessons/mastery-and-placement.yaml) | Retained | Reviewed practice/fresh evidence/version distinctions and honest browser-only progress/project limitations. |
| M01.1 | [AI grew from several older questions](lessons/history-foundations.yaml) | Retained | Retained four distinct mechanisms in the room-heating example and fixed-feedback versus learning distinction. |
| M01.2 | [Neurons, learning rules, and the Dartmouth proposal](lessons/early-ai-proposals.yaml) | Retained | Retained 1943 AND abstraction, Turing behavioral framing, and 1955 proposal versus 1956 event dates. |
| M01.3 | [Symbols, games, and early language programs](lessons/symbolic-era.yaml) | Retained | Retained complete action precondition/effect trace, Shakey setting, and explicitly invented ELIZA-style example. |
| M01.4 | [Limits, expectations, and changing support](lessons/ai-winters.yaml) | Revised | Added missing perceptron name and 1958 learning milestone before XOR limitation. |
| M01.5 | [From knowledge engineering to learning from data](lessons/expert-to-statistical.yaml) | Retained | Retained rule-chain versus fitted delivery-model comparison and hybrid maintenance requirements. |
| M01.6 | [Why deeper networks became practical](lessons/deep-learning-revival.yaml) | Revised | Added 2006 layerwise pretraining milestone to connect earlier networks to the later revival. |
| M01.7 | [Games, attention, and broadly reusable models](lessons/foundation-model-era.yaml) | Revised | Filled title-promised game history with sourced AlphaGo learned-policy/value/search combination. |
| M01.8 | [The questions that shaped AI](lessons/history.yaml) | Retained | Retained map versus timeline distinction and source-scoped historical claims. |
| M02.1 | [How a computer stores a picture or a sentence](lessons/digital-representations.yaml) | Retained | Verified UTF-8 example, 12/24-byte RGB payload, and sample-rate timing; retained representation conventions. |
| M02.2 | [Describe a computation so someone else can follow it](lessons/algorithms-and-programs.yaml) | Retained | Verified parcel loop count 2/total 9 and boundary/empty/duplicate cases. |
| M02.3 | [What a representation makes easy to learn](lessons/features-and-bias.yaml) | Retained | Verified identical brightness erasing orientation; retained explicit three-way bias distinction. |
| M02.4 | [Trace an example through a batch](lessons/tensor-shape-tracing.yaml) | Retained | Verified matrix/output shapes, broadcasting, 16/32 feature-order example, and 160-byte array. |
| M02.5 | [Why a small choice can create a huge search](lessons/search-growth.yaml) | Retained | Verified binary 15-node and ternary 40-node trees, last-level versus full count, and budget limits. |
| M02.6 | [Repeat an experiment without confusing luck with truth](lessons/randomness-reproducibility.yaml) | Retained | Verified generator cycle 4,5,0,1 and mean 80; retained reproducibility versus independent evidence. |
| M02.7 | [What makes an accelerator useful?](lessons/processors-and-parallelism.yaml) | Retained | Verified Amdahl-style 2.5 speedup, asymptotic 5, bandwidth time, and throughput/latency boundaries. |
| M02.8 | [What a demonstration proves—and what it leaves open](lessons/toy-model-limits.yaml) | Retained | Verified stripe counterexample and whole-task boundary; retained repaired-rule versus fresh-test distinction. |
| M03.1 | [From the world to a dataset](lessons/data.yaml) | Retained | Retained row/feature/target definitions, missing versus zero, split roles, and future-information leak. |
| M03.2 | [Different ways to learn](lessons/ways-to-learn.yaml) | Revised | Retained four concrete feedback sources; clarified RL seeks improvement rather than guaranteeing it. |
| M03.3 | [Where did this dataset come from?](lessons/data-provenance.yaml) | Retained | Retained ingredient card, selection-bias example, and source/transformation/coverage/use distinctions. |
| M03.4 | [Clean data without erasing the problem](lessons/data-cleaning.yaml) | Retained | Verified 4 versus 28 imputation means and unit conversion; retained unusual versus erroneous distinction. |
| M03.5 | [Protect the examples used to judge a model](lessons/splits-and-leakage.yaml) | Retained | Retained three envelopes, identity grouping, forecasting boundaries, and prompt-selection leakage. |
| M03.6 | [Who is represented by the data?](lessons/sampling-and-shift.yaml) | Revised | Added beginner population/sample and three distinct shift examples. |
| M03.7 | [Create more examples without inventing evidence](lessons/augmentation-and-synthetic-data.yaml) | Revised | Defined augmentation, synthetic, invariance, and transformation group split before evaluation. |
| M03.8 | [Decide what success means before training](lessons/baselines-and-success.yaml) | Revised | Added arithmetic consequences and local definitions for metric, threshold, abstention. |
| M04.1 | [Reason with statements that are true or false](lessons/propositional-logic.yaml) | Revised | Defined premises and entailment; supplied the missing truth-table cases and a learner prediction. |
| M04.2 | [Talk about objects and relationships](lessons/first-order-logic.yaml) | Revised | Explained predicate notation, domains, scope, and a failed unification. |
| M04.3 | [From facts to conclusions—and backward from a goal](lessons/rule-engines.yaml) | Revised | Added operational notation and an explicit forward/backward trace with unknown conditions. |
| M04.4 | [Search for a proof or a satisfying assignment](lessons/proof-search.yaml) | Revised | Defined clause, assignment, decision procedure, and explained resolution without assuming its name is familiar. |
| M04.5 | [Store relationships so they can be queried](lessons/knowledge-graphs.yaml) | Revised | Defined nodes, edges, ontology, and open/closed-world reasoning with a checkable example. |
| M04.6 | [Reason when new facts can overturn a conclusion](lessons/defaults-and-exceptions.yaml) | Revised | Translated defeasible and monotonic terminology; added a normal-case/exception explanation. |
| M04.7 | [Search for a program that fits a specification](lessons/program-synthesis.yaml) | Revised | Defined specification/search space/inductive bias and made ambiguity concrete. |
| M04.8 | [Combine explicit knowledge with learned perception](lessons/symbolic-neural-boundaries.yaml) | Revised | Explained boundary vocabulary and syntax-versus-truth using explicit structured data. |
| M05.1 | [Turn a goal into states and actions](lessons/search-problems.yaml) | Revised | Defined state, action, transition, nodes and edges before relying on graph language. |
| M05.2 | [Choose an order for exploring possibilities](lessons/uninformed-search.yaml) | Revised | Explained queue, stack, frontier and a concrete visit-order trace. |
| M05.3 | [Use an estimate without confusing it with a guarantee](lessons/heuristic-search.yaml) | Revised | Made consistency and reopening concrete; explained A-star and its symbols. |
| M05.4 | [Remove impossible choices before searching further](lessons/constraint-solving.yaml) | Revised | Defined SAT/SMT and supplied the missing local-versus-global counterexample. |
| M05.5 | [Plan while another player chooses the reply](lessons/game-search.yaml) | Revised | Added an explicit alpha-beta cutoff and defined MCTS policy/value/rollout. |
| M05.6 | [Represent what an action requires and changes](lessons/classical-planning.yaml) | Revised | Explained planning vocabulary through a state trace and concurrent resource example. |
| M05.7 | [Plan when you cannot see the whole state](lessons/planning-under-uncertainty.yaml) | Revised | Defined expected cost and chance constraints; traced value of sensing numerically. |
| M05.8 | [Improve a candidate without exploring every path](lessons/local-search.yaml) | Revised | Explained optimization vocabulary and gave a feasible-versus-high-score numerical choice. |
| M06.1 | [Probability, likelihood, and what is unknown](lessons/uncertainty-models.yaml) | Revised | Defined probability, conditioning, parameter, prior and calibration; calculated likelihood comparisons. |
| M06.2 | [Update a belief using new evidence](lessons/bayes-rule.yaml) | Revised | Defined prior/posterior/likelihood/normalization in place and showed normalization arithmetic. |
| M06.3 | [A useful classifier with a strong independence assumption](lessons/naive-bayes.yaml) | Revised | Completed both sides of the numerical classifier and defined smoothing with a count example. |
| M06.4 | [Factor a joint distribution into smaller pieces](lessons/graphical-models.yaml) | Revised | Defined distribution, DAG, parents, factor and marginalization; made missing-state calculation explicit. |
| M06.5 | [Track a hidden state from noisy observations](lessons/state-estimation.yaml) | Revised | Expanded HMM, Gaussian, covariance, residual and gain; distinguished belief update from weight training. |
| M06.6 | [Estimate a difficult average by sampling](lessons/monte-carlo.yaml) | Revised | Defined expectation, standard error, MCMC and mixing; distinguished sample variability from estimator uncertainty. |
| M06.7 | [Learn distributions over plausible explanations](lessons/bayesian-learning.yaml) | Revised | Replaced compressed specialist definitions with model averaging, kernel and approximation examples. |
| M06.8 | [Turn a probability into a justified action](lessons/calibrated-decisions.yaml) | Revised | Explained toy cost assumptions and threshold algebra; separated calibration fitting and final assessment. |
| M07.1 | [Build a tiny prediction model](lessons/prediction.yaml) | Retained | Checked role definitions, intercept and two-feature arithmetic, residual sign convention, loss contrast and all active numeric answers; existing worked sequence is suitable. |
| M07.2 | [Turn a linear score into a class probability](lessons/logistic-regression.yaml) | Revised | Replaced an unexplained formula-first opening; defined sigmoid, odds, exponential, cross-entropy and calibration with worked values. |
| M07.3 | [Predict from similar stored examples](lessons/nearest-neighbors.yaml) | Revised | Defined k/classification/regression/distance; added numeric regression and tie handling. |
| M07.4 | [Split a dataset into simpler regions](lessons/decision-trees.yaml) | Revised | Explained nodes/leaves/purity/impurity/pruning and added a full prediction path. |
| M07.5 | [Combine many imperfect predictors](lessons/tree-ensembles.yaml) | Revised | Defined bagging/bootstrap/out-of-bag and traced an additive boosting correction. |
| M07.6 | [Choose a boundary with a margin](lessons/support-vector-machines.yaml) | Revised | Explained margin/support vectors/soft violations and kernel inner products with concrete calculations. |
| M07.7 | [Control complexity without peeking at the answer](lessons/regularization-and-tuning.yaml) | Revised | Defined hyperparameter, fold, transform and nested tuning using an explicit three-fold example. |
| M07.8 | [Look inside the average score](lessons/classification-metrics.yaml) | Revised | Expanded ROC/AUC and calculated the full confusion table rather than only headline metrics. |
| M08.1 | [Find groups without assuming the groups are natural kinds](lessons/clustering.yaml) | Revised | Retained prediction lab and scale caveats; defined mean, hierarchical linkage and density neighborhood locally. |
| M08.2 | [Let several hidden sources explain the data](lessons/mixture-models.yaml) | Revised | Unpacked component, Gaussian and EM; added a weighted-mean update. |
| M08.3 | [Compress variation into fewer directions](lessons/pca-and-factorization.yaml) | Revised | Expanded PCA/SVD/rank terminology and traced centering before projection. |
| M08.4 | [Read a map without mistaking it for the territory](lessons/nonlinear-embeddings.yaml) | Revised | Defined embedding, neighborhood and prototype; explained method acronyms without turning them into prerequisites. |
| M08.5 | [Find unusual cases without assuming unusual means wrong](lessons/anomaly-detection.yaml) | Revised | Clarified reconstruction/isolation/density with a concrete alert example. |
| M08.6 | [Create a learning task from the data itself](lessons/self-supervised-representations.yaml) | Revised | Defined views, augmentation, pretext, probe and fine-tuning; illustrated collapsed features. |
| M08.7 | [Estimate what a person may find useful](lessons/recommendation-models.yaml) | Revised | Defined collaborative filtering/vector/dot product and ranked-list metrics. |
| M08.8 | [Learn from choices that your system helped create](lessons/recommendation-feedback.yaml) | Revised | Defined impressions, exposure, logging policy, propensity, overlap and online lift through actual counts. |
| M09.1 | [Distinguish fitting the sample from learning a useful rule](lessons/generalization.yaml) | Revised | Defined empirical/expected/sample/population; added a calculation and uncertainty comparison. |
| M09.2 | [Why a simpler model can predict better](lessons/bias-variance.yaml) | Revised | Corrected squared-bias decomposition and distinguished statistical bias from a neural bias parameter. |
| M09.3 | [What can a learning guarantee actually guarantee?](lessons/learning-theory.yaml) | Revised | Specified the fixed direction needed for the threshold VC example and grounded PAC probabilities. |
| M09.4 | [Test the rule where conditions change](lessons/robustness-and-shift.yaml) | Revised | Defined shift/perturbation/threat model and made a controlled stress test actionable. |
| M09.5 | [Evaluate the procedure that chose the model](lessons/evaluation-selection.yaml) | Retained | Checked all selection-rule arithmetic, metric/constraint definitions, slice analysis and protected-test wording; existing example and practice already teach the scoped outcome. |
| M09.6 | [Change one thing and measure what follows](lessons/controlled-experiments.yaml) | Revised | Defined ablation, control, confounding, paired differences and preregistration. |
| M09.7 | [More capacity changes more than one thing](lessons/scaling-and-memorization.yaml) | Revised | Defined power-law and double-descent interpretation with explicitly invented numbers. |
| M09.8 | [Make the result possible to inspect](lessons/research-reporting.yaml) | Revised | Supplied a report template and separated observation from causal explanation. |
| M10.1 | [How does a model improve a prediction?](lessons/learning-update.yaml) | Revised | Verified scalar update and optional derivative trace; removed an obsolete claim about whether this app records course evidence. |
| M10.2 | [Check a derivative against a small change](lessons/gradient-checks.yaml) | Revised | Defined numerical versus analytic/autodiff gradients and traced cancellation and reduction mismatches. |
| M10.3 | [Learn from a sample of examples at each step](lessons/stochastic-gradients.yaml) | Revised | Defined batch/minibatch/microbatch and made unequal-batch weighting explicit. |
| M10.4 | [Remember previous gradients without confusing memory with certainty](lessons/momentum-and-adam.yaml) | Revised | Explained exponential averages, moments, bias correction and the Hessian reference without requiring unexplained vocabulary. |
| M10.5 | [Constrain a solution or change the update](lessons/penalties-and-clipping.yaml) | Revised | Defined penalty/projection/norm and traced a hard limit and decoupled shrinkage. |
| M10.6 | [Read local geometry without imagining a visible map of every weight](lessons/loss-landscapes.yaml) | Revised | Defined scalar/curvature/convexity and traced a saddle with actual values. |
| M10.7 | [Keep signals and gradients in a usable range](lessons/stable-training.yaml) | Revised | Expanded fan-in/fan-out, activation, normalization and floating-point failure terms. |
| M10.8 | [Find the first broken assumption in a training run](lessons/training-debugging.yaml) | Revised | Defined shape/detachment/frozen weights and supplied a reproducible diagnostic prediction. |
| M11.1 | [Inside an artificial neuron](lessons/neurons.yaml) | Revised | Expanded ReLU on first use; verified negative weights, bias and activation trace. |
| M11.2 | [Why layers need more than multiplication](lessons/nonlinearity.yaml) | Retained | Verified all four XOR cases, affine composition, activation caveats and expressivity/optimization distinction. |
| M11.3 | [Trace inputs through layers to a loss](lessons/neural-forward-pass.yaml) | Revised | Checked both explicit network fixtures and seven-parameter count; clarified summary to avoid implying both diagrams have the same layer count. |
| M11.4 | [How an error reaches earlier weights](lessons/backpropagation.yaml) | Revised | Removed the misleading blame metaphor; verified signed derivatives, update loss and shared-parameter cancellation. |
| M11.5 | [Let the graph carry derivatives](lessons/automatic-differentiation.yaml) | Retained | Verified branch derivatives, detached value behavior, accumulation and forward/reverse explanations. |
| M11.6 | [Help information and learning signals travel](lessons/residuals-normalization-dropout.yaml) | Retained | Verified residual shapes, normalization axes and inverted-dropout expectation; examples define their simplifying assumptions. |
| M11.7 | [Connect data, gradients, and saved model state](lessons/neural-training-loop.yaml) | Retained | Verified forward/backward/update numbers, figure transition, step/epoch distinction and checkpoint state. |
| M11.8 | [What can a network’s hidden features tell us?](lessons/learned-representations.yaml) | Revised | Defined encoder/head/probe/intervention and explained decodability versus actual use with a concrete feature. |
| M12.1 | [What changes when an image changes?](lessons/image-geometry.yaml) | Revised | Defined pixel/channel, invariant/equivariant and traced an edge and transformed label. |
| M12.2 | [Slide a shared filter across an input](lessons/convolution.yaml) | Revised | Defined filter/channel/receptive field and added a size and pooling trace. |
| M12.3 | [Build visual features from local operations](lessons/convolutional-networks.yaml) | Revised | Unpacked CNN, pooling, class scores, channels and residual shape alignment. |
| M12.4 | [Locate objects and label their pixels](lessons/detection-and-segmentation.yaml) | Revised | Added a concrete task comparison, union calculation, U-Net terminology and identity-switch example. |
| M12.5 | [Treat image patches as a sequence of representations](lessons/vision-transformers.yaml) | Revised | Defined token/projection/attention/position and calculated patch vectors and attention pairs. |
| M12.6 | [Learn visual features before choosing the final task](lessons/visual-pretraining.yaml) | Revised | Explained pretraining/freeze/fine-tune and added a masked-patch example with task-specific detail. |
| M12.7 | [Infer structure that a flat image does not directly reveal](lessons/depth-motion-3d.yaml) | Revised | Defined calibration, pose, correspondence, triangulation, optical flow and 3D structures concretely. |
| M12.8 | [Test what the visual model is actually using](lessons/vision-failures.yaml) | Revised | Defined occlusion, hallucination, adversarial access and bounded perturbation through test cases. |
| M13.1 | [Predict the future without borrowing information from it](lessons/time-series.yaml) | Revised | Defined forecast origin/horizon/seasonality and added an explicit rolling split example. |
| M13.2 | [Carry a state from one step to the next](lessons/recurrent-networks.yaml) | Revised | Expanded RNN and explained hidden-state updates, unrolling and truncation with a third step. |
| M13.3 | [Choose what to keep, add, and reveal](lessons/gated-recurrence.yaml) | Revised | Expanded LSTM/GRU, defined sigmoid gate and traced the cell arithmetic. |
| M13.4 | [Map one sequence into another](lessons/sequence-to-sequence.yaml) | Revised | Defined token/tokenizer/encoder/decoder at entry; retained translation and beam-search mechanism. |
| M13.5 | [From a waveform to time-frequency features](lessons/audio-representations.yaml) | Revised | Defined amplitude/frequency/aliasing/spectrogram and traced two-channel storage. |
| M13.6 | [Map sound into words with an alignment model](lessons/speech-recognition.yaml) | Revised | Expanded CTC and showed its collapse order; defined diarization and streaming. |
| M13.7 | [Generate sound from a representation](lessons/speech-and-audio-generation.yaml) | Revised | Defined conditioning/prosody/vocoder/codec and compared equivalent spoken renditions. |
| M13.8 | [Judge quality across time, languages, and delay](lessons/sequence-evaluation.yaml) | Revised | Defined latency/edit distance/normalization and demonstrated a semantic failure hidden by small edit count. |
| M14.1 | [Words, structure, meaning, and context](lessons/language-structure.yaml) | Retained | Checked role swap, ambiguity, semantics, context and clarification activity; the concrete sentence progression is appropriate. |
| M14.2 | [Turn text into structured labels and relations](lessons/linguistic-annotation.yaml) | Revised | Defined annotation/schema/span/parser and showed exact-boundary scoring. |
| M14.3 | [Represent text with counts and short contexts](lessons/count-based-language.yaml) | Retained | Verified count denominators, sentence boundaries, smoothing and held-out probability; all toy vocabulary assumptions are explicit. |
| M14.4 | [How text becomes tokens](lessons/tokenization.yaml) | Retained | Checked token units, IDs, special-token compatibility and invented examples; avoids claiming a particular production split. |
| M14.5 | [From token IDs to learned vectors](lessons/embeddings.yaml) | Revised | Explained vector, dot product and cosine and removed the false suggestion that token-ID mapping is semantic meaning. |
| M14.6 | [Learn the units used by a language model](lessons/tokenizer-training.yaml) | Revised | Added the missing unigram alternative promised by the earlier lesson and clarified deterministic training/application boundaries. |
| M14.7 | [One vocabulary does not divide every language equally](lessons/tokenization-tradeoffs.yaml) | Revised | Defined Unicode/case folding/perplexity and added a meaningful cross-tokenizer comparison. |
| M14.8 | [How a language model takes its next step](lessons/next-token.yaml) | Revised | Defined autoregressive, removed stale future-platform claims, and explained stopping instead of implying unbounded repetition. |
| M15.1 | [Look back at the information needed for this step](lessons/attention-motivation.yaml) | Revised | Defined fixed-vector bottleneck, query/key/value and showed coordinate-wise mixing arithmetic. |
| M15.2 | [Attention: queries, keys, and values](lessons/attention.yaml) | Revised | Reduced duplicate explanations and made the changed-value scene build on the prior arithmetic. |
| M15.3 | [From attention scores to a causal mask](lessons/softmax-attention.yaml) | Revised | Explained ln/exp before expecting inverse-operation arithmetic and clarified all-masked rows. |
| M15.4 | [Run several learned comparisons in parallel](lessons/multi-head-attention.yaml) | Retained | Verified both scalar mixtures, concatenation, projection, width counting and causal masks. |
| M15.5 | [Give a transformer information about order](lessons/positional-encodings.yaml) | Retained | Verified additive vectors, common versus relative rotations, positional/mask distinction and limits of long-context extrapolation. |
| M15.6 | [Separate mixing across tokens from transforming one token](lessons/transformer-block-components.yaml) | Revised | Defined feed-forward/SwiGLU/SiLU/RMSNorm and added gate and normalization examples. |
| M15.7 | [Match information flow to the learning objective](lessons/transformer-families.yaml) | Revised | Defined bidirectional/causal/source-target with a matched three-task example. |
| M15.8 | [Follow one token through a transformer](lessons/transformer-trace.yaml) | Retained | Checked vocabulary-versus-attention distinction, residual sum, dense attention versus cached cost, and explicit decoder-only scope. |
| M16.1 | [Choose the model that pretraining will fit](lessons/base-model-design.yaml) | Retained | Verified model/table dimensions, dense versus routed distinction, initialization and artifact recipe. |
| M16.2 | [Build a traceable corpus before spending training compute](lessons/pretraining-data-pipeline.yaml) | Retained | Verified sequential filter counts, provenance/contamination distinction and final token stream. |
| M16.3 | [Choose how much the model sees of each source](lessons/training-data-mixtures.yaml) | Revised | Distinguished source-token occurrences from vocabulary token types in the oversampling example. |
| M16.4 | [Assemble token batches without leaking targets](lessons/packing-and-masking.yaml) | Retained | Verified adjacent target counts, source boundaries, loss denominator and attention-versus-loss masks. |
| M16.5 | [Choose what a pretraining prediction means](lessons/pretraining-objectives.yaml) | Retained | Verified negative-log loss, masked versus causal access, reduction examples and objective scope. |
| M16.6 | [Inside a language model training step](lessons/training-loop.yaml) | Retained | Verified shifted targets, forward/backward/update separation, accumulation arithmetic and held-out evaluation. |
| M16.7 | [Allocate compute and preserve useful checkpoints](lessons/pretraining-budget-and-checkpoints.yaml) | Revised | Defined FLOPs/utilization/scheduler and gave a recovery interval calculation. |
| M16.8 | [Continue pretraining without losing sight of the starting model](lessons/continued-pretraining.yaml) | Revised | Defined continued pretraining, forgetting, lineage and context extension through a matched before/after comparison. |
| M17.1 | [Why arithmetic counts do not tell the whole speed story](lessons/compute-and-bandwidth.yaml) | Revised | Defined throughput/bandwidth/intensity/kernel and traced the larger-bound example. |
| M17.2 | [Account for everything that occupies accelerator memory](lessons/training-memory.yaml) | Revised | Defined optimizer moments/activations/buffers/allocator and made byte components explicit. |
| M17.3 | [Train replicas on different examples and combine their gradients](lessons/data-parallel-training.yaml) | Revised | Defined replica/worker/all-reduce and calculated an unequal-token gradient. |
| M17.4 | [Split a model across devices in different ways](lessons/model-parallel-training.yaml) | Revised | Explained tensor/pipeline/context/expert partitions and traced a pipeline bubble. |
| M17.5 | [Save memory by sharing state or recreating it](lessons/sharding-and-recomputation.yaml) | Revised | Defined shards/ownership/offload/prefetch and illustrated uneven memory savings. |
| M17.6 | [Spend numerical precision where it is needed](lessons/mixed-precision-training.yaml) | Revised | Defined floating-point parts and worked loss scaling with unscaling. |
| M17.7 | [Compute attention with less memory traffic](lessons/efficient-attention-kernels.yaml) | Revised | Defined tile/fusion/online softmax and gave an exact rescaling example. |
| M17.8 | [Make a large training run recoverable and auditable](lessons/reliable-training-operations.yaml) | Revised | Defined shards/integrity/replay and separated power, energy and research cost. |
| M18.1 | [Give each token a selected route through some parameters](lessons/conditional-computation.yaml) | Revised | Expanded MoE/sparse/dense and distinguished routing activations from changing weights. |
| M18.2 | [Score experts and choose a small set](lessons/routers-and-top-k.yaml) | Retained | Verified top-two selection, selected-mass renormalization, vector mixture and k=1 behavior; conventions and expert non-specialization are already explicit. |
| M18.3 | [Follow a token through dispatch, experts, and combination](lessons/expert-dispatch-and-combine.yaml) | Revised | Clarified dispatch versus combination and restored-token identity through a concrete record. |
| M18.4 | [Count total capacity and active work separately](lessons/moe-parameter-accounting.yaml) | Revised | Added explicit storage and top-two counts while avoiding active-memory conflation. |
| M18.5 | [Keep expert loads from overwhelming the execution plan](lessons/expert-capacity-and-balance.yaml) | Revised | Explained capacity, auxiliary loss and dropless execution with explicit overflow numbers. |
| M18.6 | [Separate always-on experts from routed specialists](lessons/shared-and-fine-grained-experts.yaml) | Revised | Defined expert granularity/width and traced shared-plus-routed work. |
| M18.7 | [Understand how sparse routes learn and cross device boundaries](lessons/moe-gradients-and-communication.yaml) | Revised | Worked fixed-route derivatives and explained discrete switches and all-to-all transfer. |
| M18.8 | [Serve sparse models under real traffic](lessons/serving-expert-models.yaml) | Revised | Defined resident/interconnect/latency/throughput and showed the batching tradeoff. |
| M19.1 | [Choose which token pairs may communicate](lessons/attention-patterns.yaml) | Revised | Defined window/sparse/global/dilated links and traced indirect access across two layers. |
| M19.2 | [Reduce the state stored for attention keys and values](lessons/shared-and-latent-kv.yaml) | Revised | Expanded MQA/GQA/MLA and gave explicit grouped cache payload counts. |
| M19.3 | [Rearrange attention around a compressed running summary](lessons/linear-attention.yaml) | Revised | Added a scalar worked summary before the general matrix formula and explained phi, transpose and denominator. |
| M19.4 | [Represent a sequence through an evolving hidden state](lessons/state-space-sequences.yaml) | Revised | Defined every recurrence symbol and explained time-invariant/discretization with retained state. |
| M19.5 | [Let the current input control what the state retains](lessons/selective-state-spaces.yaml) | Revised | Defined input-dependent selection and scan without equating a toy gate with complete Mamba. |
| M19.6 | [Combine attention, recurrence, and convolution deliberately](lessons/hybrid-sequence-architectures.yaml) | Revised | Added a concrete state budget and defined architectural ablation. |
| M19.7 | [Distinguish accepting a long prompt from using it well](lessons/long-context-capability.yaml) | Revised | Explained effective context, distractors and a reproducible position-controlled experiment. |
| M19.8 | [Compare sequence architectures with an honest budget](lessons/architecture-tradeoff-study.yaml) | Revised | Supplied a decision example and defined operating-point/prefill/decode comparison. |
| M20.1 | [Track what each adaptation stage changes](lessons/posttraining-stages.yaml) | Retained | Checked demonstration/preference/reward stages, retained-skill evaluation and inference-only changes; recipe questions already define scope clearly. |
| M20.2 | [Learn response behavior from demonstrations](lessons/supervised-fine-tuning.yaml) | Retained | Verified response-only denominator, teacher forcing, role templates and demonstration versus in-context use; scoped examples are clear. |
| M20.3 | [Adapt a model by learning a smaller parameter update](lessons/low-rank-adaptation.yaml) | Revised | Expanded LoRA/QLoRA, defined rank/frozen and traced actual small factor multiplication. |
| M20.4 | [Learn a scoring signal from response comparisons](lessons/preferences-and-reward-models.yaml) | Revised | Defined rubric, reward score and sigmoid difference with an equal-score example. |
| M20.5 | [Optimize a language policy against feedback while limiting drift](lessons/rlhf-and-kl-control.yaml) | Revised | Expanded RLHF/PPO/KL, defined policy/rollout/baseline and clarified clipping is not a hard bound. |
| M20.6 | [Train on preference pairs without a separate online reward loop](lessons/direct-preference-optimization.yaml) | Revised | Expanded DPO and gave explicit relative-likelihood arithmetic without teaching the wrong absolute-probability rule. |
| M20.7 | [Transfer behavior through teacher outputs and selected examples](lessons/distillation-and-selection.yaml) | Revised | Defined teacher/student/soft targets and distinguished filtering from exact probabilistic rejection sampling. |
| M20.8 | [Measure adaptation gains without overlooking regressions](lessons/posttraining-evaluation.yaml) | Revised | Defined regression, slice, win rate and rollback with a task-specific acceptance example. |
| M21.1 | [Separate a correct solution from a convincing explanation](lessons/reasoning-and-explanations.yaml) | Revised | Defined correctness/validity/faithfulness through a checkable arithmetic contrast. |
| M21.2 | [Teach a useful starting style for problem solving](lessons/reasoning-demonstrations.yaml) | Revised | Defined trace/cold start and supplied concise, verifiable worked demonstration. |
| M21.3 | [Turn checkable outcomes into a learning signal](lessons/verifiable-rewards.yaml) | Revised | Defined verifier/tolerance/equivalence and gave positive and negative checks. |
| M21.4 | [Compare several sampled solutions to form a baseline](lessons/group-relative-policy-learning.yaml) | Revised | Expanded GRPO and defined standard deviation/zero variance and distinct policy roles. |
| M21.5 | [Choose whether to score the result, the steps, or both](lessons/process-and-outcome-rewards.yaml) | Revised | Supplied a valid-final/invalid-method example and defined reward granularity and proxy gaming. |
| M21.6 | [Spend extra generation on candidates, checks, and search](lessons/inference-time-search.yaml) | Revised | Defined best-of-n/self-consistency/branching and counted discarded candidate work. |
| M21.7 | [Use tools to check work within an explicit stopping policy](lessons/reasoning-with-tools-and-budgets.yaml) | Revised | Defined tool contract, observation and stopping with a concrete unit conversion. |
| M21.8 | [Transfer reasoning behavior and compare its operating cost](lessons/reasoning-distillation-and-cost.yaml) | Revised | Clarified selection versus deployment success and provided total-cost comparison. |
| M22.1 | [Predicting a label, generating a possibility](lessons/generative-models.yaml) | Revised | Defined distribution/sample/fidelity and separated latent variables from all generative architectures. |
| M22.2 | [Generate different kinds of data one unit at a time](lessons/autoregressive-modalities.yaml) | Revised | Defined chain rule and codebook with a two-unit probability example. |
| M22.3 | [Learn a latent representation and a way back to data](lessons/autoencoders-and-vaes.yaml) | Revised | Expanded VAE/ELBO and defined approximate posterior/prior/standard Gaussian/collapse. |
| M22.4 | [Train a generator against a learned discriminator](lessons/generative-adversarial-learning.yaml) | Revised | Expanded GAN, defined generator/discriminator and separated gradient feedback from copies of real samples. |
| M22.5 | [Represent probability through invertible maps or energy scores](lessons/flows-and-energy-models.yaml) | Revised | Defined Jacobian and partition function after simple examples; distinguished energy from physical energy. |
| M22.6 | [How an image can emerge from noise](lessons/denoising.yaml) | Revised | Defined noisy-state symbols and gave actual noising arithmetic; clarified sampling does not reconstruct a particular hidden training image. |
| M22.7 | [Why image generators work in latent space](lessons/latent-diffusion.yaml) | Retained | Verified training-versus-sampling table, guidance convention and vector example, encoder/denoiser roles and backbone comparison; scoped explanation already contains the essential transitions. |
| M22.8 | [Learn a velocity field and integrate it into samples](lessons/flow-matching-and-solvers.yaml) | Revised | Defined velocity/ODE/coupling and worked interpolation and Euler values. |
| M23.1 | [Connect information expressed in different forms](lessons/multimodal-alignment-and-fusion.yaml) | Revised | Clarified fusion stages with one shared animal example and uncalibrated-score caveat. |
| M23.2 | [Bring matching images and descriptions closer in representation space](lessons/contrastive-image-text-learning.yaml) | Revised | Added numerical similarity matrix and false-negative contrast limitation. |
| M23.3 | [Connect a vision encoder to a language model](lessons/vision-language-interfaces.yaml) | Revised | Explained encoder, projector, prefix, and cross-attention in local context. |
| M23.4 | [Turn images, sound, and video into manageable model inputs](lessons/modality-tokenization.yaml) | Revised | Added audio-codec budget with explicit serialization assumption. |
| M23.5 | [Train alignment, generation, and instruction behavior across modalities](lessons/multimodal-training-lifecycle.yaml) | Revised | Explained frozen components and loss masks with a visual answer example. |
| M23.6 | [Model motion and persistence across frames](lessons/video-models.yaml) | Revised | Added temporal sampling arithmetic and connection to video diffusion. |
| M23.7 | [Predict what may happen next, with or without actions](lessons/world-models-and-predictive-representations.yaml) | Revised | Added an action-conditioned rollout and cumulative model-error example. |
| M23.8 | [Check whether answers actually follow the supplied media](lessons/multimodal-grounding-evaluation.yaml) | Revised | Added diagnostic chart walkthrough and expanded OCR. |
| M24.1 | [Learn decisions from consequences over time](lessons/reinforcement-learning-loop.yaml) | Revised | Grounded RL vocabulary in a single maze example. |
| M24.2 | [Choose between known rewards and learning about alternatives](lessons/bandits-and-exploration.yaml) | Revised | Added exact epsilon-greedy probabilities and definitions of arm and regret. |
| M24.3 | [Relate the value of a state to its next step](lessons/mdps-and-bellman-equations.yaml) | Revised | Added stochastic Bellman backup with all weights explicit. |
| M24.4 | [Update values from sampled transitions](lessons/temporal-difference-and-q-learning.yaml) | Revised | Added complete Q update and SARSA contrast missing from survey. |
| M24.5 | [Approximate action values with a neural network](lessons/deep-q-networks.yaml) | Revised | Added DQN numerical target and Double DQN selection/evaluation distinction. |
| M24.6 | [Learn a policy directly from its outcomes](lessons/policy-gradients-and-actor-critic.yaml) | Revised | Explained advantage and separate actor/critic roles with numerical example. |
| M24.7 | [Plan with learned dynamics when the full state is hidden](lessons/model-based-and-partially-observed-rl.yaml) | Revised | Explained belief states and expanded POMDP. |
| M24.8 | [Learn from recorded decisions without assuming safe exploration](lessons/offline-rl-and-imitation.yaml) | Revised | Added concrete imitation shift and DAgger data-collection mechanism. |
| M25.1 | [Decide where a system follows a workflow and where it chooses actions](lessons/agents-and-workflows.yaml) | Revised | Defined autonomy and distinguished acting from learning. |
| M25.2 | [Make actions and observations explicit data contracts](lessons/tool-contracts-and-state.yaml) | Revised | Added concrete validation, execution, and retry example. |
| M25.3 | [Turn a plan into checked execution with recovery paths](lessons/agent-planning-and-recovery.yaml) | Revised | Explained idempotence and compensation without treating them as universal undo. |
| M25.4 | [Decide what to retain and what to show the model now](lessons/agent-memory-and-context.yaml) | Revised | Retained clear four-layer memory distinction and Monday/Tuesday correction example. |
| M25.5 | [Coordinate several decision-makers without assuming independent judgment](lessons/multi-agent-coordination.yaml) | Revised | Made coordination cost measurable with a toy critical path. |
| M25.6 | [Learn when other decision-makers are learning too](lessons/multi-agent-learning-and-games.yaml) | Revised | Worked rock-paper-scissors equilibrium and explained decentralized execution. |
| M25.7 | [Keep the authority to act outside retrieved content](lessons/agent-permissions-and-untrusted-input.yaml) | Revised | Retained explicit execution-layer controls, scoped approval, and bounded synthetic tests. |
| M25.8 | [Evaluate the completed task and the trajectory that produced it](lessons/agent-evaluation.yaml) | Revised | Added task outcome and cost denominator example. |
| M26.1 | [Find documents through an index of their words](lessons/lexical-information-retrieval.yaml) | Revised | Expanded TF-IDF and taught rarity/length effects before ranking jargon. |
| M26.2 | [Search learned representations with approximate neighbors](lessons/dense-vector-retrieval.yaml) | Revised | Added exact-vs-approximate neighbor example and defined dual encoder. |
| M26.3 | [Prepare retrievable evidence without losing its context](lessons/retrieval-ingestion-and-chunking.yaml) | Revised | Added concrete boundary loss without awkward not/condition wording. |
| M26.4 | [Improve candidate retrieval and rank the useful evidence](lessons/hybrid-search-and-reranking.yaml) | Revised | Added reciprocal-rank fusion example and retrieval metric distinction. |
| M26.5 | [Retrieve evidence and condition an answer on it](lessons/rag-evidence-pipeline.yaml) | Revised | Expanded RAG and traced a qualification into an answer. |
| M26.6 | [Check whether a source supports the claim beside it](lessons/citations-and-evidence-fidelity.yaml) | Revised | Added concrete support/coverage calculation with stated claim-count convention. |
| M26.7 | [Choose how information should reach the model](lessons/retrieval-context-and-fine-tuning.yaml) | Revised | Retained changing-handbook example and complementary behavior/evidence mechanisms. |
| M26.8 | [Keep retrieved evidence current, permitted, and resistant to manipulation](lessons/retrieval-boundaries-and-failures.yaml) | Revised | Retained concrete access-cache, stale-version, and poisoning/injection distinctions. |
| M27.1 | [Load a compatible model and prepare its exact input](lessons/inference-request-preparation.yaml) | Revised | Added artifact vocabulary and an explicit input/output budget. |
| M27.2 | [From a prompt to a stream of tokens](lessons/cached-inference.yaml) | Retained | Retained complete prefill/decode trace; checked 512 bytes per position and 8 KiB for 16 positions. |
| M27.3 | [Turn logits into a controlled generation procedure](lessons/decoding-and-sampling.yaml) | Retained | Retained worked softmax, temperature, truncation, and interval examples; checked displayed probabilities. |
| M27.4 | [Schedule many requests around shared hardware](lessons/batching-streaming-and-cache-management.yaml) | Revised | Added concrete cache-block fragmentation example. |
| M27.5 | [Reduce deployment cost while measuring what changes](lessons/quantization-pruning-and-compression.yaml) | Revised | Worked scale, rounding, saturation, and byte savings with metadata caveat. |
| M27.6 | [Let a cheap draft propose tokens for a target model to verify](lessons/speculative-decoding.yaml) | Revised | Added a two-token acceptance/correction walkthrough proving the target distribution. |
| M27.7 | [Place model computation where memory and latency allow it](lessons/distributed-and-edge-serving.yaml) | Revised | Added replica-versus-shard capacity example and expanded edge terminology. |
| M27.8 | [Choose a deployment using quality and workload evidence](lessons/serving-metrics-and-cost.yaml) | Revised | Added end-to-end latency and useful-completion cost arithmetic. |
| M28.1 | [Measure the behavior that the task actually needs](lessons/evaluation-metrics-and-uncertainty.yaml) | Revised | Made small-sample uncertainty and clustered examples concrete. |
| M28.2 | [Build a test whose score supports the intended claim](lessons/benchmark-design-and-comparison.yaml) | Retained | Retained full challenge design, budget comparison, contamination, and pass@k explanation. |
| M28.3 | [Treat evaluators as fallible measurement instruments](lessons/human-and-model-judges.yaml) | Retained | Retained rubric, factual-evidence visual, reference calibration, and position-swap control. |
| M28.4 | [Find failures hidden by an overall score](lessons/robustness-and-slice-testing.yaml) | Revised | Worked aggregate score concealing minority-slice failure. |
| M28.5 | [Evaluate claims against evidence and recognize missing information](lessons/factuality-and-abstention.yaml) | Revised | Added selective accuracy and coverage example with explicit denominators. |
| M28.6 | [Ask what an explanation method actually measures](lessons/attribution-and-counterfactual-explanations.yaml) | Revised | Added inspectable linear attribution and baseline dependence. |
| M28.7 | [Test hypotheses about internal representations and computation](lessons/mechanistic-interpretability.yaml) | Revised | Made probing, ablation, and activation patching distinct through one controlled example. |
| M28.8 | [Make conclusions match the strength of the experiment](lessons/causal-evaluation-and-negative-results.yaml) | Revised | Clarified confounding, practical size, and statistical power. |
| M29.1 | [Decide whose problem the system solves and who bears its errors](lessons/stakeholders-and-deployment-decisions.yaml) | Revised | Retained worker scheduling example and practical authority requirements for human review. |
| M29.2 | [Choose fairness measurements that match the decision context](lessons/fairness-definitions-and-tradeoffs.yaml) | Revised | Extended one consistent confusion matrix to expose all relevant denominators. |
| M29.3 | [Understand what training and deployment can reveal about data](lessons/privacy-and-memorization.yaml) | Revised | Explained privacy units, epsilon/delta, and composition without asserting a breach probability. |
| M29.4 | [Distinguish manipulated inputs, training data, and model artifacts](lessons/adversarial-and-supply-chain-risks.yaml) | Revised | Clarified attacker access and limits of file hashes. |
| M29.5 | [Protect tools and sensitive data around the model](lessons/application-security-boundaries.yaml) | Revised | Made generated text versus authorized operations concrete. |
| M29.6 | [Align measured behavior with intended human constraints](lessons/alignment-and-oversight.yaml) | Revised | Added a reward-proxy failure illustrating why monitoring the real goal matters. |
| M29.7 | [Assess labor, access, resources, and accountability across the lifecycle](lessons/ai-and-society.yaml) | Revised | Added resource-accounting example without unsupported environmental equivalence. |
| M29.8 | [Discuss broad intelligence and experience without overstating evidence](lessons/agi-consciousness-and-uncertainty.yaml) | Revised | Expanded AGI and grounded experience/behavior distinction; avoided current-system verdict. |
| M30.1 | [Connect measurements and actions to a physical body](lessons/robot-sensors-and-frames.yaml) | Revised | Explained calibration and physical quantities in local terms. |
| M30.2 | [Correct motion using measured error](lessons/feedback-and-robot-control.yaml) | Revised | Expanded PID and connected its accumulated/change terms to arithmetic before calculus. |
| M30.3 | [Estimate where the robot is while learning the map](lessons/localization-mapping-and-slam.yaml) | Revised | Defined pose, drift, data association, and gauge-relative maps concretely. |
| M30.4 | [Turn a desired pose into feasible movement](lessons/kinematics-and-motion-planning.yaml) | Revised | Added elementary forward/inverse kinematics and planner intuitions. |
| M30.5 | [Learn physical actions from demonstrations](lessons/robot-imitation-learning.yaml) | Revised | Explained collection interfaces and gave the multimodal-trajectory averaging trap numbers. |
| M30.6 | [Learn in simulation and test what transfers](lessons/robot-rl-and-sim-to-real.yaml) | Revised | Added numerical reward misspecification and domain-gap example. |
| M30.7 | [Connect visual instructions to a robot’s action interface](lessons/vision-language-action-models.yaml) | Revised | Expanded VLA and worked action discretization with boundary convention. |
| M30.8 | [Evaluate closed-loop behavior under physical uncertainty](lessons/physical-ai-evaluation.yaml) | Revised | Quantified hidden interventions and stale-state displacement. |
| M31.1 | [Ask what would change if an action changed the world](lessons/causal-graphs-and-interventions.yaml) | Revised | Explained confounder, mediator, collider, and why adjusting everything can fail. |
| M31.2 | [State the assumptions behind effects that cannot all be observed](lessons/counterfactuals-and-identification.yaml) | Revised | Explained identification versus estimation with a randomized toy contrast. |
| M31.3 | [Reuse learning when the next task or domain changes](lessons/transfer-and-domain-adaptation.yaml) | Revised | Worked negative transfer relative to a fair target baseline. |
| M31.4 | [Distinguish examples in a prompt from learning to adapt weights](lessons/few-shot-meta-and-in-context-learning.yaml) | Revised | Defined support/query sets and gave inner/outer learning a concrete task. |
| M31.5 | [Learn new information while measuring what is forgotten](lessons/continual-and-online-learning.yaml) | Revised | Quantified retention and defined plasticity. |
| M31.6 | [Choose which examples to learn from next](lessons/active-and-curriculum-learning.yaml) | Revised | Retained concrete ten-label budget and independent-evaluation cautions. |
| M31.7 | [Use unlabeled data and imperfect label sources carefully](lessons/semi-supervised-and-weak-learning.yaml) | Revised | Added contrasting pseudo-label and weak-rule examples. |
| M31.8 | [Coordinate learning while data remain distributed](lessons/federated-and-decentralized-learning.yaml) | Revised | Worked record-weighted averaging and privacy distinction. |
| M32.1 | [Search with a population of varied candidates](lessons/evolutionary-search.yaml) | Revised | Defined variation operators and worked recombination. |
| M32.2 | [Evolve programs, weights, or architectures](lessons/genetic-programming-and-neuroevolution.yaml) | Revised | Translated expression trees and demonstrated a subtree mutation. |
| M32.3 | [Coordinate simple searchers through shared signals](lessons/swarm-optimization.yaml) | Revised | Added numerical particle movement and pheromone evaporation. |
| M32.4 | [Represent graded membership without confusing it with probability](lessons/fuzzy-sets-and-control.yaml) | Revised | Worked membership conjunction and a specifically identified zero-order Sugeno output. |
| M32.5 | [Reuse past cases and combine explicit knowledge with learned predictions](lessons/case-based-and-hybrid-decisions.yaml) | Revised | Retained repair example, adaptation, and explicit ownership of conflicting decisions. |
| M32.6 | [Connect learned representations with explicit reasoning constraints](lessons/neuro-symbolic-learning.yaml) | Revised | Added numerical soft constraint and relation to encoded versus real facts. |
| M32.7 | [Choose expensive experiments using a surrogate model](lessons/bayesian-optimization-and-automl.yaml) | Revised | Defined surrogate and acquisition through an uncertainty-bonus example. |
| M32.8 | [Choose a search or hybrid method for the constraints you have](lessons/comparing-search-and-hybrid-methods.yaml) | Revised | Added concrete objective-budget comparison. |
| M33.1 | [Choose a useful problem before choosing a model](lessons/ai-product-framing.yaml) | Revised | Retained coherent library pilot, baseline, constraints, fallback, and ownership sequence. |
| M33.2 | [Keep training and serving connected to the same definitions](lessons/production-data-and-model-artifacts.yaml) | Revised | Aligned opening metaphor with the board-game example; retained unit and tokenizer mismatch traces. |
| M33.3 | [Release changes with evidence and a recovery path](lessons/evaluation-releases-and-rollback.yaml) | Retained | Retained distinctions among offline, shadow, canary, A/B, operational stop rules, and rollback. |
| M33.4 | [Notice when the production task changes](lessons/monitoring-drift-and-retraining.yaml) | Retained | Retained input drift versus changed target and operating-failure diagnosis examples. |
| M33.5 | [Build a reliable request path around local or remote inference](lessons/ai-service-boundaries.yaml) | Revised | Expanded API and backpressure with concrete cancellation behavior. |
| M33.6 | [Give people useful control over model-assisted work](lessons/human-review-and-user-experience.yaml) | Retained | Retained sustained review-desk example, local definitions, and meaningful correction controls. |
| M33.7 | [Plan for traffic, failures, and ongoing resource use](lessons/operational-capacity-and-reliability.yaml) | Revised | Worked arrival/service mismatch and defined graceful degradation. |
| M33.8 | [Apply the same lifecycle questions to different products](lessons/applied-ai-case-comparisons.yaml) | Revised | Added comparable measurement questions across products. |
| M34.1 | [Learn by exchanging messages across a graph](lessons/graph-neural-networks.yaml) | Revised | Defined permutation, over-smoothing, and over-squashing in the neighborhood example. |
| M34.2 | [Build symmetry into predictions about geometry](lessons/equivariant-scientific-learning.yaml) | Revised | Worked scalar/vector rotation and defined symmetry group and chirality. |
| M34.3 | [Learn functions while using equations or families of solutions](lessons/physics-informed-models-and-operators.yaml) | Revised | Added a complete differential-equation residual and boundary-condition counterexample. |
| M34.4 | [Evaluate scientific predictions beyond familiar benchmarks](lessons/biological-and-molecular-modeling.yaml) | Revised | Explained protein sequence, alignment, scaffold, and prediction target without clinical claims. |
| M34.5 | [Match event-driven computation to a scientific workload](lessons/neuromorphic-scientific-applications.yaml) | Revised | Added event representation and bounded latency intuition. |
| M34.6 | [Use models to propose experiments and test hypotheses](lessons/ai-assisted-discovery.yaml) | Revised | Added concrete distinguishable-hypothesis experiment. |
| M34.7 | [Evaluate new computing and learning claims without assuming a breakthrough](lessons/emerging-architecture-evidence.yaml) | Revised | Defined quantum measurement, oracle assumptions, and barren plateaus without speedup hype. |
| M34.8 | [Maintain a research record that can change with evidence](lessons/following-the-research-frontier.yaml) | Revised | Added concrete versioned claim ledger separating reported gain from attribution. |
| M35.1 | [Read a model release as an inspectable set of artifacts](lessons/model-report-and-artifact-inventory.yaml) | Revised | Added beginner artifact definitions and executable inventory exercise. |
| M35.2 | [Trace the Llama 3.1 dense decoder lifecycle](lessons/llama-three-case-study.yaml) | Revised | Rechecked report v3; added Table 3 cache calculation and plain post-training mechanism. |
| M35.3 | [Compare Qwen3 dense and MoE models with reasoning modes](lessons/qwen-three-case-study.yaml) | Revised | Rechecked original report; unpacked pretraining and four adaptation stages without generalizing to later releases. |
| M35.4 | [Trace DeepSeek-V3 from sparse architecture to distributed serving](lessons/deepseek-v3-case-study.yaml) | Revised | Rechecked report section 4.2 architecture; clarified shared/routed expert counts and active versus resident storage. |
| M35.5 | [Separate DeepSeek-R1, R1-Zero, and distilled students](lessons/deepseek-r1-case-study.yaml) | Revised | Rechecked original report; added explicit lineage and reward distinctions. |
| M35.6 | [Inspect the Olmo 3 model flow](lessons/olmo-three-case-study.yaml) | Revised | Rechecked report v2; explained midtraining and branched evidence rather than treating the family as one recipe. |
| M35.7 | [Compare language, image, audio, and state-space artifacts](lessons/cross-modal-model-case-comparison.yaml) | Revised | Added two concrete input-to-output chains and clear persistent-state scope. |
| M35.8 | [Read proprietary reports without inventing hidden architecture](lessons/proprietary-model-evidence-boundaries.yaml) | Revised | Added identifiability example without inventing undisclosed architecture. |
| M36.1 | [Project: explain AI through a historical concept map](lessons/history-and-concept-map-project.yaml) | Revised | Retained concrete deliverable, three edge meanings, counterexample, and honest self/peer rubric. |
| M36.2 | [Project: compare a baseline with a learned predictor](lessons/classical-prediction-project.yaml) | Revised | Clarified that visible test rows are reserved by protocol, not concealed by the app. |
| M36.3 | [Project: trace a tiny network and one gradient update](lessons/small-network-gradient-project.yaml) | Revised | Verified both gradients −2, simultaneous parameters 1.2, prediction 2.88, loss 0.0072; retained complete project. |
| M36.4 | [Project: build a tiny next-token model and checkpoint ledger](lessons/tiny-language-model-project.yaml) | Revised | Verified counts and natural-log losses; clarified selection-set role versus independent final test. |
| M36.5 | [Project: compare dense and sparse model lifecycles](lessons/dense-and-moe-comparison-project.yaml) | Revised | Verified decimal 20/80 GB accounting and explicit fictional versus sourced model distinction. |
| M36.6 | [Project: trace a grounded answer and a controlled tool action](lessons/retrieval-and-tool-workflow-project.yaml) | Revised | Verified all six self-contained mock traces; retained evidence and authorization separation. |
| M36.7 | [Project: reproduce a result and audit an ablation](lessons/ablation-and-reproduction-project.yaml) | Revised | Verified all losses and clarified nats and ablation vocabulary. |
| M36.8 | [Final project: defend an end-to-end AI system design](lessons/architecture-defense-project.yaml) | Revised | Retained scoped brief, complete lanes, explicit tests, deliverable, and human capstone review. |
| M36.9 | [Project: specify and test a conditional image generator](lessons/image-generation-project.yaml) | Revised | Verified both condition rules, fixture outcomes, 2/4 adherence, and meaningful-diversity limitation. |
| M36.10 | [Project: trace and evaluate a tiny video generator](lessons/video-generation-project.yaml) | Retained | Verified 144-byte payload, four-frame duration versus final timestamp, and separate temporal criteria. |
| M36.11 | [Project: trace a speech and audio system](lessons/speech-audio-project.yaml) | Retained | Verified 32,000-byte waveform and minimum three-edit alignment; retained recognition/synthesis distinction. |
| M36.12 | [Project: trace a robot sensing and control loop](lessons/robotics-system-project.yaml) | Retained | Verified bounded controller, true versus stale state, and 1/1.5/1.75 trace; retained limitations. |
| M37.1 | [Update connections from local activity](lessons/hebbian-and-local-learning.yaml) | Revised | Defined local activity, synapse terms, and an Oja correction numerically. |
| M37.2 | [Recover patterns through energy-based state dynamics](lessons/associative-memory-and-boltzmann-models.yaml) | Revised | Retained two-unit asynchronous recall; verified fixed-weight energy +1 to −1 and sampling distinction. |
| M37.3 | [Learn a dictionary or a neighborhood-organized representation](lessons/sparse-coding-and-self-organizing-maps.yaml) | Revised | Worked coefficient reconstruction and prototype movement; defined overcomplete. |
| M37.4 | [Follow voltage, leakage, threshold, and reset](lessons/integrate-and-fire-neurons.yaml) | Revised | Defined membrane state, refractory interval, and reset convention after verified arithmetic. |
| M37.5 | [Learn with spike timing or an approximate backward signal](lessons/spike-timing-and-surrogate-gradients.yaml) | Revised | Expanded STDP, translated potentiation/depression, and added threshold-gradient contrast. |
| M37.6 | [Use fixed recurrent dynamics and train a readout](lessons/reservoir-computing.yaml) | Revised | Defined readout, fading memory, washout, and spectral radius through a scalar reservoir. |
| M37.7 | [Learn a vector field and let a solver define continuous depth](lessons/neural-ordinary-differential-equations.yaml) | Revised | Expanded ODE and quantified Euler approximation error with local symbol definitions. |
| M37.8 | [Compare learning rules, state dynamics, and hardware evidence](lessons/comparing-alternative-neural-models.yaml) | Revised | Retained accurate comparison of state, parameter, signal, and hardware boundaries; simplified summary. |
