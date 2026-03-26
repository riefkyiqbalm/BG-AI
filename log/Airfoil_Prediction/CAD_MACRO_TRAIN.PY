"""
CAD Macro Code Training Pipeline
Trains a model to generate VBA macro code from CAD modeling method descriptions.

Modeling Types:
- Parametric Modeling (3D)
- Direct Modeling / Editing
- Surface Modeling
- Sub-Division (Sub-D) Modeling
- Hybrid Modeling (combination)
"""

import os
import json
import re
import logging
from dataclasses import dataclass, field
from typing import Optional
from enum import Enum

# ─────────────────────────────────────────────
# 1.  DEPENDENCIES  (install if missing)
# ─────────────────────────────────────────────
try:
    import torch
    from torch.utils.data import Dataset, DataLoader
    from transformers import (
        AutoTokenizer,
        AutoModelForSeq2SeqLM,
        TrainingArguments,
        Trainer,
        DataCollatorForSeq2Seq,
        EarlyStoppingCallback,
    )
    from peft import LoraConfig, get_peft_model, TaskType
    import numpy as np
    from sklearn.model_selection import train_test_split
    HAS_DEPS = True
except ImportError as e:
    HAS_DEPS = False
    _MISSING = str(e)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)s  %(message)s",
)
logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────
# 2.  ENUMS & DATACLASSES
# ─────────────────────────────────────────────

class ModelingType(Enum):
    PARAMETRIC    = "parametric_3d"
    DIRECT        = "direct_modeling"
    SURFACE       = "surface_modeling"
    SUBDIVISION   = "subdivision_modeling"
    HYBRID        = "hybrid_modeling"


@dataclass
class MacroSample:
    """Single training sample: natural-language description → VBA macro."""
    modeling_type: ModelingType
    description:   str          # human-readable task description
    vba_code:      str          # ground-truth VBA macro
    metadata:      dict = field(default_factory=dict)

    def to_training_pair(self) -> dict:
        """Format as an instruction-following pair."""
        prompt = (
            f"[MODELING_TYPE]: {self.modeling_type.value}\n"
            f"[TASK]: {self.description}\n"
            f"[GENERATE_VBA_MACRO]:"
        )
        return {"input": prompt, "output": self.vba_code}


# ─────────────────────────────────────────────
# 3.  SAMPLE DATA FACTORY
#     (replace / extend with your real dataset)
# ─────────────────────────────────────────────

def build_sample_dataset() -> list[MacroSample]:
    """
    Returns a starter dataset covering all five modeling types.
    In production, load these from files or a database.
    """
    samples = [

        # ── PARAMETRIC ──────────────────────────────────────────────────────
        MacroSample(
            modeling_type=ModelingType.PARAMETRIC,
            description="Create a parametric box with configurable length, width, and height using feature-based modeling",
            vba_code="""Sub CreateParametricBox()
    Dim swApp As SldWorks.SldWorks
    Dim swModel As SldWorks.ModelDoc2
    Dim swSketchMgr As SldWorks.SketchManager
    Dim swFeatMgr As SldWorks.FeatureManager

    ' Parameters
    Dim dLength As Double: dLength = 0.1  ' 100 mm in meters
    Dim dWidth  As Double: dWidth  = 0.05 ' 50 mm
    Dim dHeight As Double: dHeight = 0.075 ' 75 mm

    Set swApp   = Application.SldWorks
    Set swModel = swApp.ActiveDoc

    ' Create sketch on Front Plane
    swModel.SketchManager.InsertSketch True
    swModel.SketchManager.CreateCenterRectangle _
        0, 0, 0, dLength / 2, dWidth / 2, 0

    swModel.SketchManager.InsertSketch False

    ' Extrude
    swModel.FeatureManager.FeatureExtrusion2 _
        True, False, False, 0, 0, dHeight, 0, _
        False, False, False, False, _
        0, 0, False, False, False, False, True, True, True, 0, 0, False

    swModel.ViewZoomtofit2
    MsgBox "Parametric box created: " & dLength*1000 & "x" & dWidth*1000 & "x" & dHeight*1000 & " mm"
End Sub""",
            metadata={"software": "SolidWorks", "complexity": "beginner"}
        ),

        MacroSample(
            modeling_type=ModelingType.PARAMETRIC,
            description="Create a parametric cylinder with radius and height parameters, then add a fillet to the top edge",
            vba_code="""Sub CreateParametricCylinder()
    Dim swApp   As SldWorks.SldWorks
    Dim swModel As SldWorks.ModelDoc2

    Dim dRadius As Double: dRadius = 0.025  ' 25 mm
    Dim dHeight As Double: dHeight = 0.08   ' 80 mm
    Dim dFillet As Double: dFillet = 0.003  '  3 mm

    Set swApp   = Application.SldWorks
    Set swModel = swApp.ActiveDoc

    ' Sketch circle on Top Plane
    swModel.Extension.SelectByID2 "Top Plane", "PLANE", 0, 0, 0, False, 0, Nothing, 0
    swModel.SketchManager.InsertSketch True
    swModel.SketchManager.CreateCircleByRadius 0, 0, 0, dRadius
    swModel.SketchManager.InsertSketch False

    ' Extrude
    swModel.FeatureManager.FeatureExtrusion2 _
        True, False, False, 0, 0, dHeight, 0, _
        False, False, False, False, _
        0, 0, False, False, False, False, True, True, True, 0, 0, False

    ' Fillet top edge
    Dim swFeat As SldWorks.Feature
    swModel.Extension.SelectByID2 "Edge<1>", "EDGE", 0, dHeight, 0, False, 0, Nothing, 0
    swModel.FeatureManager.FeatureFillet dFillet, True, False, False, Nothing, Nothing, Nothing

    swModel.ViewZoomtofit2
End Sub""",
            metadata={"software": "SolidWorks", "complexity": "intermediate"}
        ),

        # ── DIRECT MODELING ──────────────────────────────────────────────────
        MacroSample(
            modeling_type=ModelingType.DIRECT,
            description="Move a selected face of a solid body by a specified offset distance using direct editing",
            vba_code="""Sub DirectMoveFace()
    Dim swApp     As SldWorks.SldWorks
    Dim swModel   As SldWorks.ModelDoc2
    Dim swSelMgr  As SldWorks.SelectionMgr
    Dim swMoveFaceFeatureData As Object

    Dim dOffset As Double: dOffset = 0.01  ' 10 mm

    Set swApp    = Application.SldWorks
    Set swModel  = swApp.ActiveDoc
    Set swSelMgr = swModel.SelectionManager

    ' Assumes user has pre-selected a face
    If swSelMgr.GetSelectedObjectCount2(-1) = 0 Then
        MsgBox "Please select a face first.", vbExclamation
        Exit Sub
    End If

    Dim swFeat As SldWorks.Feature
    Set swFeat = swModel.FeatureManager.InsertMoveFace( _
        swMoveFaceOffset_e, False, dOffset, 0, 0, 0, Nothing, Nothing)

    If Not swFeat Is Nothing Then
        MsgBox "Face moved by " & dOffset * 1000 & " mm successfully."
    Else
        MsgBox "Move face operation failed.", vbCritical
    End If

    swModel.ViewZoomtofit2
End Sub""",
            metadata={"software": "SolidWorks", "complexity": "intermediate"}
        ),

        MacroSample(
            modeling_type=ModelingType.DIRECT,
            description="Delete a selected face and heal the resulting gap using direct modeling fill",
            vba_code="""Sub DirectDeleteAndHealFace()
    Dim swApp    As SldWorks.SldWorks
    Dim swModel  As SldWorks.ModelDoc2
    Dim swSelMgr As SldWorks.SelectionMgr

    Set swApp    = Application.SldWorks
    Set swModel  = swApp.ActiveDoc
    Set swSelMgr = swModel.SelectionManager

    If swSelMgr.GetSelectedObjectCount2(-1) = 0 Then
        MsgBox "Select a face to delete.", vbExclamation
        Exit Sub
    End If

    ' Delete face with heal option (swDeleteFaceHeal = 2)
    Dim bRet As Boolean
    bRet = swModel.FeatureManager.InsertDeleteFace(2)

    If bRet Then
        MsgBox "Face deleted and healed successfully."
    Else
        MsgBox "Delete face operation failed.", vbCritical
    End If
End Sub""",
            metadata={"software": "SolidWorks", "complexity": "intermediate"}
        ),

        # ── SURFACE MODELING ─────────────────────────────────────────────────
        MacroSample(
            modeling_type=ModelingType.SURFACE,
            description="Create a lofted surface through multiple profile sketches for aerodynamic body design",
            vba_code="""Sub CreateLoftedSurface()
    Dim swApp    As SldWorks.SldWorks
    Dim swModel  As SldWorks.ModelDoc2
    Dim swFeatMgr As SldWorks.FeatureManager

    Set swApp    = Application.SldWorks
    Set swModel  = swApp.ActiveDoc
    Set swFeatMgr = swModel.FeatureManager

    ' Select profiles (sketches must exist)
    Dim profiles(2) As String
    profiles(0) = "Sketch1"
    profiles(1) = "Sketch2"
    profiles(2) = "Sketch3"

    Dim i As Integer
    For i = 0 To 2
        swModel.Extension.SelectByID2 profiles(i), "SKETCH", 0, 0, 0, True, 0, Nothing, 0
    Next i

    ' Create surface loft
    Dim swFeat As SldWorks.Feature
    Set swFeat = swFeatMgr.InsertSurfaceLoft( _
        Nothing, True, True, False, False, _
        0.5, 0.5, False, False, False, False, 0, 0, False)

    If Not swFeat Is Nothing Then
        MsgBox "Lofted surface created successfully."
    Else
        MsgBox "Loft failed. Check profile sketches.", vbCritical
    End If

    swModel.ViewZoomtofit2
End Sub""",
            metadata={"software": "SolidWorks", "complexity": "advanced"}
        ),

        MacroSample(
            modeling_type=ModelingType.SURFACE,
            description="Create a boundary surface between two edge curves with tangency continuity",
            vba_code="""Sub CreateBoundarySurface()
    Dim swApp    As SldWorks.SldWorks
    Dim swModel  As SldWorks.ModelDoc2

    Set swApp   = Application.SldWorks
    Set swModel = swApp.ActiveDoc

    ' Select direction-1 curves
    swModel.Extension.SelectByID2 "Sketch1", "SKETCH", 0, 0, 0, False, 1, Nothing, 0
    swModel.Extension.SelectByID2 "Sketch2", "SKETCH", 0, 0, 0, True,  1, Nothing, 0

    ' Select direction-2 curves (guide curves)
    swModel.Extension.SelectByID2 "Sketch3", "SKETCH", 0, 0, 0, True, 2, Nothing, 0
    swModel.Extension.SelectByID2 "Sketch4", "SKETCH", 0, 0, 0, True, 2, Nothing, 0

    Dim swFeat As SldWorks.Feature
    Set swFeat = swModel.FeatureManager.InsertSurfaceBoundary( _
        False, True)          ' [closed, curvature control]

    If Not swFeat Is Nothing Then
        MsgBox "Boundary surface created."
    Else
        MsgBox "Boundary surface failed.", vbCritical
    End If
End Sub""",
            metadata={"software": "SolidWorks", "complexity": "advanced"}
        ),

        # ── SUB-DIVISION ─────────────────────────────────────────────────────
        MacroSample(
            modeling_type=ModelingType.SUBDIVISION,
            description="Create a Sub-D mesh cage from a base box and apply subdivision smoothing levels",
            vba_code="""Sub CreateSubDMesh()
    ' Sub-D modeling via SolidWorks 3D Sculptor (xShape)
    Dim swApp   As SldWorks.SldWorks
    Dim swModel As SldWorks.ModelDoc2
    Dim swFeat  As SldWorks.Feature

    Dim nSubdivLevel As Integer: nSubdivLevel = 3  ' smoothing iterations

    Set swApp   = Application.SldWorks
    Set swModel = swApp.ActiveDoc

    ' Insert Sub-D body (box primitive as cage)
    swModel.Extension.SelectByID2 "Front Plane", "PLANE", 0, 0, 0, False, 0, Nothing, 0

    Set swFeat = swModel.FeatureManager.InsertSubDFeature( _
        swSubDPrimitiveBox_e, _  ' primitive type: box cage
        0.1, 0.1, 0.1, _         ' dimensions (m)
        nSubdivLevel)

    If Not swFeat Is Nothing Then
        ' Activate Sub-D edit mode
        swModel.Extension.SelectByID2 swFeat.Name, "BODYFEATURE", 0, 0, 0, False, 0, Nothing, 0
        swModel.FeatureManager.EditSubDFeature
        MsgBox "Sub-D cage created with " & nSubdivLevel & " subdivision levels." & _
               Chr(10) & "You can now manipulate control vertices."
    Else
        MsgBox "Sub-D feature creation failed.", vbCritical
    End If

    swModel.ViewZoomtofit2
End Sub""",
            metadata={"software": "SolidWorks 3D Sculptor", "complexity": "advanced"}
        ),

        # ── HYBRID ───────────────────────────────────────────────────────────
        MacroSample(
            modeling_type=ModelingType.HYBRID,
            description="Build a hybrid car body: parametric chassis base, surface-modeled panels, Sub-D organic details, direct-edited mounting points",
            vba_code="""Sub HybridCarBodyWorkflow()
    '========================================================
    ' HYBRID WORKFLOW: Parametric + Surface + Sub-D + Direct
    '========================================================
    Dim swApp    As SldWorks.SldWorks
    Dim swModel  As SldWorks.ModelDoc2
    Dim swFeat   As SldWorks.Feature

    Set swApp   = Application.SldWorks
    Set swModel = swApp.ActiveDoc

    '--- STEP 1: Parametric base (chassis skeleton) -----------
    Call CreateParametricChassis(swModel)

    '--- STEP 2: Surface panels (aerodynamic body) ------------
    Call CreateSurfacePanels(swModel)

    '--- STEP 3: Sub-D organic details (bumpers/grille) -------
    Call CreateSubDDetails(swModel)

    '--- STEP 4: Direct editing (mounting holes/brackets) -----
    Call DirectEditMountingPoints(swModel)

    swModel.ViewZoomtofit2
    MsgBox "Hybrid car body workflow completed successfully!"
End Sub

' ─── Helper: Parametric chassis ──────────────────────────────
Private Sub CreateParametricChassis(swModel As SldWorks.ModelDoc2)
    swModel.Extension.SelectByID2 "Top Plane", "PLANE", 0, 0, 0, False, 0, Nothing, 0
    swModel.SketchManager.InsertSketch True
    swModel.SketchManager.CreateCenterRectangle 0, 0, 0, 2.2, 0.9, 0
    swModel.SketchManager.InsertSketch False
    swModel.FeatureManager.FeatureExtrusion2 _
        True, False, False, 0, 0, 0.15, 0, _
        False, False, False, False, _
        0, 0, False, False, False, False, True, True, True, 0, 0, False
End Sub

' ─── Helper: Surface panels ──────────────────────────────────
Private Sub CreateSurfacePanels(swModel As SldWorks.ModelDoc2)
    swModel.Extension.SelectByID2 "Sketch_Hood",  "SKETCH", 0, 0, 0, False, 1, Nothing, 0
    swModel.Extension.SelectByID2 "Sketch_Trunk", "SKETCH", 0, 0, 0, True,  1, Nothing, 0
    swModel.Extension.SelectByID2 "Sketch_GuideL","SKETCH", 0, 0, 0, True,  2, Nothing, 0
    swModel.Extension.SelectByID2 "Sketch_GuideR","SKETCH", 0, 0, 0, True,  2, Nothing, 0
    swModel.FeatureManager.InsertSurfaceBoundary False, True
End Sub

' ─── Helper: Sub-D details ───────────────────────────────────
Private Sub CreateSubDDetails(swModel As SldWorks.ModelDoc2)
    swModel.Extension.SelectByID2 "Front Plane", "PLANE", 0, 0, 0, False, 0, Nothing, 0
    swModel.FeatureManager.InsertSubDFeature swSubDPrimitiveSphere_e, 0.3, 0.15, 0.1, 2
End Sub

' ─── Helper: Direct edit mounting points ─────────────────────
Private Sub DirectEditMountingPoints(swModel As SldWorks.ModelDoc2)
    swModel.Extension.SelectByID2 "Face_MountL", "FACE", -0.5, 0, 0.1, False, 0, Nothing, 0
    swModel.FeatureManager.InsertDeleteFace 2
    swModel.Extension.SelectByID2 "Face_MountR", "FACE",  0.5, 0, 0.1, False, 0, Nothing, 0
    swModel.FeatureManager.InsertDeleteFace 2
End Sub""",
            metadata={"software": "SolidWorks", "complexity": "expert"}
        ),
    ]
    return samples


# ─────────────────────────────────────────────
# 4.  DATA PREPARATION
# ─────────────────────────────────────────────

def prepare_dataset(samples: list[MacroSample]) -> dict:
    """Split samples into train / validation / test sets."""
    pairs = [s.to_training_pair() for s in samples]

    train_val, test  = train_test_split(pairs, test_size=0.1,  random_state=42)
    train,     val   = train_test_split(train_val, test_size=0.15, random_state=42)

    logger.info(f"Dataset split → train: {len(train)}, val: {len(val)}, test: {len(test)}")
    return {"train": train, "validation": val, "test": test}


def save_dataset(dataset: dict, out_dir: str = "data") -> None:
    """Persist dataset to JSON files."""
    os.makedirs(out_dir, exist_ok=True)
    for split, records in dataset.items():
        path = os.path.join(out_dir, f"{split}.json")
        with open(path, "w", encoding="utf-8") as f:
            json.dump(records, f, indent=2, ensure_ascii=False)
        logger.info(f"Saved {len(records)} records → {path}")


def load_dataset(data_dir: str = "data") -> dict:
    """Load dataset from JSON files."""
    dataset = {}
    for split in ("train", "validation", "test"):
        path = os.path.join(data_dir, f"{split}.json")
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                dataset[split] = json.load(f)
    return dataset


# ─────────────────────────────────────────────
# 5.  PYTORCH DATASET
# ─────────────────────────────────────────────

class MacroCodeDataset(Dataset):
    """Tokenised dataset for seq2seq training."""

    def __init__(self, records: list[dict], tokenizer, max_input: int = 512, max_target: int = 1024):
        self.records    = records
        self.tokenizer  = tokenizer
        self.max_input  = max_input
        self.max_target = max_target

    def __len__(self) -> int:
        return len(self.records)

    def __getitem__(self, idx: int) -> dict:
        record = self.records[idx]

        model_inputs = self.tokenizer(
            record["input"],
            max_length=self.max_input,
            padding="max_length",
            truncation=True,
            return_tensors="pt",
        )

        with self.tokenizer.as_target_tokenizer():
            labels = self.tokenizer(
                record["output"],
                max_length=self.max_target,
                padding="max_length",
                truncation=True,
                return_tensors="pt",
            )

        label_ids = labels["input_ids"].squeeze()
        # Replace padding token id with -100 so loss ignores padding
        label_ids[label_ids == self.tokenizer.pad_token_id] = -100

        return {
            "input_ids":      model_inputs["input_ids"].squeeze(),
            "attention_mask": model_inputs["attention_mask"].squeeze(),
            "labels":         label_ids,
        }


# ─────────────────────────────────────────────
# 6.  MODEL SETUP (with optional LoRA PEFT)
# ─────────────────────────────────────────────

def load_model_and_tokenizer(
    model_name: str = "Salesforce/codet5-base",
    use_lora: bool = True,
):
    """
    Load a code-aware seq2seq model.
    Default: CodeT5-base (efficient for code generation).
    Alternatives: 'Salesforce/codet5-large', 'google/flan-t5-base'
    """
    logger.info(f"Loading tokenizer & model: {model_name}")
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model     = AutoModelForSeq2SeqLM.from_pretrained(model_name)

    if use_lora:
        lora_cfg = LoraConfig(
            task_type=TaskType.SEQ_2_SEQ_LM,
            r=16,
            lora_alpha=32,
            target_modules=["q", "v"],
            lora_dropout=0.1,
            bias="none",
        )
        model = get_peft_model(model, lora_cfg)
        model.print_trainable_parameters()

    return model, tokenizer


# ─────────────────────────────────────────────
# 7.  TRAINING
# ─────────────────────────────────────────────

def train_model(
    model,
    tokenizer,
    dataset: dict,
    output_dir: str  = "./cad_macro_model",
    epochs:     int  = 10,
    batch_size: int  = 4,
    lr:         float = 3e-4,
    use_fp16:   bool  = False,
) -> Trainer:
    """Fine-tune the model on CAD macro pairs."""

    train_ds = MacroCodeDataset(dataset["train"],      tokenizer)
    val_ds   = MacroCodeDataset(dataset["validation"], tokenizer)

    data_collator = DataCollatorForSeq2Seq(
        tokenizer, model=model, label_pad_token_id=-100, pad_to_multiple_of=8
    )

    training_args = TrainingArguments(
        output_dir=output_dir,
        num_train_epochs=epochs,
        per_device_train_batch_size=batch_size,
        per_device_eval_batch_size=batch_size,
        learning_rate=lr,
        warmup_ratio=0.1,
        weight_decay=0.01,
        lr_scheduler_type="cosine",
        evaluation_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
        metric_for_best_model="eval_loss",
        greater_is_better=False,
        predict_with_generate=True,
        fp16=use_fp16,
        logging_steps=10,
        report_to="none",
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_ds,
        eval_dataset=val_ds,
        tokenizer=tokenizer,
        data_collator=data_collator,
        callbacks=[EarlyStoppingCallback(early_stopping_patience=3)],
    )

    logger.info("Starting training …")
    trainer.train()
    trainer.save_model(output_dir)
    tokenizer.save_pretrained(output_dir)
    logger.info(f"Model saved to '{output_dir}'")

    return trainer


# ─────────────────────────────────────────────
# 8.  INFERENCE
# ─────────────────────────────────────────────

class VBAMacroGenerator:
    """
    Loads a fine-tuned model and generates VBA macro code
    from a modeling type + task description.
    """

    def __init__(self, model_dir: str = "./cad_macro_model"):
        logger.info(f"Loading fine-tuned model from '{model_dir}'")
        self.tokenizer = AutoTokenizer.from_pretrained(model_dir)
        self.model     = AutoModelForSeq2SeqLM.from_pretrained(model_dir)
        self.model.eval()

    def generate(
        self,
        modeling_type: ModelingType,
        description:   str,
        max_new_tokens: int   = 1024,
        num_beams:      int   = 5,
        temperature:    float = 0.7,
        top_p:          float = 0.92,
    ) -> str:
        """
        Generate a VBA macro for the given modeling type and description.

        Args:
            modeling_type:  One of the ModelingType enum values.
            description:    Natural-language task description.
            max_new_tokens: Maximum token length for generated code.
            num_beams:      Beam search width (higher = more thorough).
            temperature:    Sampling temperature (lower = more deterministic).
            top_p:          Nucleus sampling probability.

        Returns:
            Generated VBA macro as a string.
        """
        prompt = (
            f"[MODELING_TYPE]: {modeling_type.value}\n"
            f"[TASK]: {description}\n"
            f"[GENERATE_VBA_MACRO]:"
        )

        inputs = self.tokenizer(
            prompt,
            return_tensors="pt",
            max_length=512,
            truncation=True,
        )

        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=max_new_tokens,
                num_beams=num_beams,
                temperature=temperature,
                top_p=top_p,
                do_sample=(temperature < 1.0),
                early_stopping=True,
                no_repeat_ngram_size=3,
            )

        generated = self.tokenizer.decode(outputs[0], skip_special_tokens=True)

        # Strip echoed prompt if present
        marker = "[GENERATE_VBA_MACRO]:"
        if marker in generated:
            generated = generated.split(marker, 1)[-1].strip()

        return self._post_process_vba(generated)

    # ── Helpers ──────────────────────────────────────────────────────────────

    @staticmethod
    def _post_process_vba(code: str) -> str:
        """Clean up generated VBA code."""
        # Ensure Sub/End Sub framing
        if not re.search(r'\bSub\b', code, re.IGNORECASE):
            code = f"Sub GeneratedMacro()\n{code}\nEnd Sub"

        # Standardise line endings
        code = code.replace("\r\n", "\n").replace("\r", "\n")

        # Remove any trailing whitespace per line
        lines = [ln.rstrip() for ln in code.split("\n")]
        return "\n".join(lines)


# ─────────────────────────────────────────────
# 9.  EVALUATION
# ─────────────────────────────────────────────

def evaluate_model(
    generator: VBAMacroGenerator,
    test_records: list[dict],
    verbose: bool = False,
) -> dict:
    """
    Simple evaluation: BLEU score + exact-match ratio.
    Returns a metrics dict.
    """
    try:
        from nltk.translate.bleu_score import sentence_bleu, SmoothingFunction
        import nltk
        nltk.download("punkt", quiet=True)
    except ImportError:
        logger.warning("nltk not installed; skipping BLEU. Run: pip install nltk")
        return {}

    smoother = SmoothingFunction().method4
    bleu_scores, exact_matches = [], 0

    for rec in test_records:
        # Re-parse the prompt to extract type & description
        lines = rec["input"].split("\n")
        mod_type_val  = lines[0].replace("[MODELING_TYPE]:", "").strip()
        description   = lines[1].replace("[TASK]:", "").strip()

        # Find matching enum
        try:
            mod_type = ModelingType(mod_type_val)
        except ValueError:
            mod_type = ModelingType.HYBRID

        prediction = generator.generate(mod_type, description)
        reference  = rec["output"]

        # BLEU
        ref_tokens  = reference.split()
        pred_tokens = prediction.split()
        score = sentence_bleu([ref_tokens], pred_tokens, smoothing_function=smoother)
        bleu_scores.append(score)

        if prediction.strip() == reference.strip():
            exact_matches += 1

        if verbose:
            logger.info(f"\n{'─'*60}\nDESC: {description}\nBLEU: {score:.4f}\n")

    metrics = {
        "bleu_mean":    float(np.mean(bleu_scores)),
        "bleu_std":     float(np.std(bleu_scores)),
        "exact_match":  exact_matches / len(test_records) if test_records else 0.0,
        "num_samples":  len(test_records),
    }

    logger.info(f"\n{'═'*40}\nEvaluation Results:\n{json.dumps(metrics, indent=2)}\n{'═'*40}")
    return metrics


# ─────────────────────────────────────────────
# 10.  MAIN PIPELINE
# ─────────────────────────────────────────────

def run_full_pipeline(
    data_dir:   str  = "data",
    model_dir:  str  = "./cad_macro_model",
    epochs:     int  = 10,
    batch_size: int  = 4,
    use_lora:   bool = True,
    skip_train: bool = False,
) -> None:
    """
    End-to-end pipeline:
      1. Build / load dataset
      2. Load model
      3. Fine-tune
      4. Evaluate
      5. Demo inference
    """
    if not HAS_DEPS:
        logger.error(
            f"Missing dependency: {_MISSING}\n"
            "Install all requirements:\n"
            "  pip install torch transformers peft scikit-learn numpy nltk\n"
            "  # For LoRA support: pip install peft\n"
        )
        return

    # ── Step 1: Dataset ───────────────────────────────────────
    logger.info("=== Step 1: Building dataset ===")
    samples = build_sample_dataset()
    dataset = prepare_dataset(samples)
    save_dataset(dataset, data_dir)

    # ── Step 2 & 3: Train ─────────────────────────────────────
    model, tokenizer = load_model_and_tokenizer(use_lora=use_lora)

    if not skip_train:
        logger.info("=== Step 2: Training ===")
        train_model(model, tokenizer, dataset,
                    output_dir=model_dir, epochs=epochs, batch_size=batch_size)

    # ── Step 4: Evaluate ──────────────────────────────────────
    logger.info("=== Step 3: Evaluating ===")
    generator = VBAMacroGenerator(model_dir)
    metrics   = evaluate_model(generator, dataset["test"], verbose=True)

    # ── Step 5: Demo ──────────────────────────────────────────
    logger.info("=== Step 4: Demo Inference ===")
    demo_cases = [
        (ModelingType.PARAMETRIC,  "Create a parametric sphere with configurable radius"),
        (ModelingType.DIRECT,      "Scale a selected solid body by a uniform factor"),
        (ModelingType.SURFACE,     "Create a swept surface along a helix path"),
        (ModelingType.SUBDIVISION, "Build a Sub-D organic blob shape with 4 levels of subdivision"),
        (ModelingType.HYBRID,      "Design a shoe sole combining parametric midsole and Sub-D upper"),
    ]

    for mod_type, desc in demo_cases:
        print(f"\n{'═'*60}")
        print(f"TYPE : {mod_type.value}")
        print(f"TASK : {desc}")
        print(f"{'─'*60}")
        vba = generator.generate(mod_type, desc)
        print(vba)


# ─────────────────────────────────────────────
# ENTRY POINT
# ─────────────────────────────────────────────

if __name__ == "__main__":
    run_full_pipeline(
        data_dir   = "data",
        model_dir  = "./cad_macro_model",
        epochs     = 10,
        batch_size = 4,
        use_lora   = True,
        skip_train = False,   # set True to skip training, go straight to inference
    )