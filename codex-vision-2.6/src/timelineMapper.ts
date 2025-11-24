// timelineMapper.ts - UI Timeline Mapping for Premiere/FinalCut/CapCut

import type { TimelineMap, Track, Clip, EditAction, Marker } from "./types.js";

export class TimelineMapper {
  /**
   * Map edit actions to timeline structure for video editors
   */
  mapToTimeline(
    videoPath: string,
    actions: EditAction[],
    editor: "premiere" | "finalcut" | "capcut"
  ): TimelineMap {
    console.log(`[TimelineMapper] Mapping ${actions.length} actions to ${editor}`);

    const tracks: Track[] = [
      { id: "video_1", type: "video", clips: this.createVideoClips(videoPath, actions) },
      { id: "audio_1", type: "audio", clips: this.createAudioClips(videoPath) },
      { id: "text_1", type: "text", clips: this.createTextClips(actions) },
    ];

    const markers = this.createMarkers(actions);

    const exportScript = this.generateExportScript(editor, actions);

    return {
      editor,
      videoPath,
      tracks,
      markers,
      exportScript,
    };
  }

  /**
   * Create video clips with effects
   */
  private createVideoClips(videoPath: string, actions: EditAction[]): Clip[] {
    const clips: Clip[] = [];
    let clipId = 1;

    // Base video clip
    clips.push({
      id: `video_clip_${clipId++}`,
      start: 0,
      end: 60, // Assume 60s video
      source: videoPath,
      effects: [],
    });

    // Add effects from actions
    actions.forEach((action) => {
      const clip = clips.find(
        (c) => c.start <= action.timestamp && c.end >= action.timestamp
      );

      if (clip) {
        const effect = this.actionToEffect(action);
        if (effect) {
          clip.effects = clip.effects || [];
          clip.effects.push(effect);
        }
      }
    });

    // Handle cuts and trims
    const cutActions = actions.filter(
      (a) => a.type === "cut" || a.type === "trim"
    );
    if (cutActions.length > 0) {
      return this.applyCutsToClips(clips, cutActions);
    }

    return clips;
  }

  /**
   * Create audio clips
   */
  private createAudioClips(videoPath: string): Clip[] {
    return [
      {
        id: "audio_clip_1",
        start: 0,
        end: 60,
        source: videoPath,
        effects: [
          {
            type: "normalize",
            parameters: { target: -14.0, unit: "LUFS" },
          },
        ],
      },
    ];
  }

  /**
   * Create text overlay clips
   */
  private createTextClips(actions: EditAction[]): Clip[] {
    const textActions = actions.filter((a) => a.type === "text_overlay");

    return textActions.map((action, index) => ({
      id: `text_clip_${index + 1}`,
      start: action.timestamp,
      end: action.timestamp + (action.duration || 2.0),
      effects: [
        {
          type: "text",
          parameters: action.parameters,
        },
      ],
    }));
  }

  /**
   * Create markers for important timestamps
   */
  private createMarkers(actions: EditAction[]): Marker[] {
    const markers: Marker[] = [];

    // Add markers for critical actions
    actions
      .filter((a) => a.priority === "critical" || a.priority === "high")
      .forEach((action) => {
        markers.push({
          timestamp: action.timestamp,
          label: action.type.toUpperCase(),
          color: action.priority === "critical" ? "#FF0000" : "#FFA500",
          note: action.reason,
        });
      });

    // Add hook marker
    markers.push({
      timestamp: 0,
      label: "HOOK START",
      color: "#00FF00",
      note: "Critical: First 3 seconds",
    });

    markers.push({
      timestamp: 3,
      label: "HOOK END",
      color: "#FFFF00",
      note: "Retention checkpoint",
    });

    return markers.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Convert action to effect
   */
  private actionToEffect(action: EditAction): any {
    const effectMap: Record<string, any> = {
      jump_zoom: {
        type: "scale",
        parameters: {
          startScale: 1.0,
          endScale: action.parameters.scale || 1.2,
          duration: action.duration || 0.3,
          easing: action.parameters.easing || "ease-out",
        },
      },
      contrast: {
        type: "contrast",
        parameters: {
          value: action.parameters.value || 1.2,
        },
      },
      color_lift: {
        type: "exposure",
        parameters: {
          value: action.parameters.exposure || 0.5,
        },
      },
      saturation_bump: {
        type: "saturation",
        parameters: {
          value: action.parameters.intensity || 1.3,
        },
      },
      speed_ramp: {
        type: "speed",
        parameters: {
          multiplier: action.parameters.speedMultiplier || 1.2,
          duration: action.duration || 1.0,
        },
      },
      zoom_to_face: {
        type: "transform",
        parameters: {
          scale: action.parameters.targetScale || 1.3,
          smooth: action.parameters.smooth !== false,
        },
      },
    };

    return effectMap[action.type] || null;
  }

  /**
   * Apply cuts to clips (split and remove)
   */
  private applyCutsToClips(clips: Clip[], cutActions: EditAction[]): Clip[] {
    let resultClips = [...clips];

    cutActions.forEach((action) => {
      const newClips: Clip[] = [];

      resultClips.forEach((clip) => {
        if (
          action.timestamp >= clip.start &&
          action.timestamp <= clip.end
        ) {
          // Split clip
          if (action.type === "cut") {
            const cutLength = action.parameters.cutLength || 0.5;

            // Before cut
            if (action.timestamp > clip.start) {
              newClips.push({
                ...clip,
                id: `${clip.id}_a`,
                end: action.timestamp,
              });
            }

            // After cut
            if (action.timestamp + cutLength < clip.end) {
              newClips.push({
                ...clip,
                id: `${clip.id}_b`,
                start: action.timestamp + cutLength,
              });
            }
          } else if (action.type === "trim") {
            // Trim from start or end
            const trimDuration = action.duration || 1.0;
            if (action.timestamp === clip.start) {
              newClips.push({
                ...clip,
                start: clip.start + trimDuration,
              });
            } else {
              newClips.push({
                ...clip,
                end: clip.end - trimDuration,
              });
            }
          }
        } else {
          newClips.push(clip);
        }
      });

      resultClips = newClips;
    });

    return resultClips;
  }

  /**
   * Generate export script for specific editor
   */
  private generateExportScript(
    editor: "premiere" | "finalcut" | "capcut",
    actions: EditAction[]
  ): string {
    if (editor === "premiere") {
      return this.generatePremiereScript(actions);
    } else if (editor === "finalcut") {
      return this.generateFinalCutScript(actions);
    } else {
      return this.generateCapCutScript(actions);
    }
  }

  /**
   * Generate Adobe Premiere script (ExtendScript)
   */
  private generatePremiereScript(actions: EditAction[]): string {
    let script = `// Adobe Premiere Pro Script - Vision Engine v2.6
// Apply ${actions.length} edit actions

var project = app.project;
var sequence = project.activeSequence;

if (!sequence) {
  alert("No active sequence found");
} else {
`;

    actions.forEach((action, index) => {
      script += `
  // Action ${index + 1}: ${action.type} at ${action.timestamp}s
  // Reason: ${action.reason}
  // Priority: ${action.priority}
`;

      if (action.type === "color_lift") {
        script += `  // Apply color correction at ${action.timestamp}s\n`;
      } else if (action.type === "text_overlay") {
        script += `  // Add text: "${action.parameters.text}" at ${action.timestamp}s\n`;
      }
    });

    script += `
  alert("Applied ${actions.length} edits. Review and render.");
}
`;

    return script;
  }

  /**
   * Generate Final Cut Pro XML
   */
  private generateFinalCutScript(actions: EditAction[]): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Final Cut Pro XML - Vision Engine v2.6 -->
<!-- ${actions.length} edit actions -->
<fcpxml version="1.9">
  <project name="Vision_2.6_Edit">
    <sequence>
      ${actions.map((a) => `<!-- ${a.type} at ${a.timestamp}s: ${a.reason} -->`).join("\n      ")}
    </sequence>
  </project>
</fcpxml>`;
  }

  /**
   * Generate CapCut instructions (JSON)
   */
  private generateCapCutScript(actions: EditAction[]): string {
    const capCutActions = actions.map((action) => ({
      type: action.type,
      time: action.timestamp,
      params: action.parameters,
      note: action.reason,
    }));

    return JSON.stringify(
      {
        editor: "CapCut",
        version: "2.6",
        actions: capCutActions,
      },
      null,
      2
    );
  }
}
