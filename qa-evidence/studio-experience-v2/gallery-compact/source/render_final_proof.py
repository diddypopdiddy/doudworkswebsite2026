#!/usr/bin/env python3
"""Offline visual proof for the final compact-gallery blend; it never saves edits."""
from pathlib import Path
import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parent.parent
QA = ROOT / "qa"


def web(p):
    return (p[0], -p[2], p[1])


def aim(obj, target):
    obj.rotation_euler = (Vector(web(target)) - obj.location).to_track_quat("-Z", "Y").to_euler()


def area(name, pos, target, energy, size):
    data = bpy.data.lights.new(name, "AREA")
    data.energy, data.shape, data.size = energy, "DISK", size
    obj = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(obj)
    obj.location = web(pos)
    aim(obj, target)
    return obj


def camera(name, pos, target, lens):
    data = bpy.data.cameras.new(name)
    data.lens = lens
    obj = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(obj)
    obj.location = web(pos)
    aim(obj, target)
    return obj


def render(scene, cam, path):
    scene.camera = cam
    scene.render.filepath = str(path)
    bpy.ops.render.render(write_still=True)


def main():
    QA.mkdir(exist_ok=True)
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x, scene.render.resolution_y = 1400, 900
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.world.color = (.16, .18, .20)
    # These temporary fixtures give the proof images runtime-like readable fill;
    # this script does not save the blend after rendering.
    area("PROOF_MAIN_KEY", (-.5, 2.58, 1.70), (0, 1.4, -2.1), 780, 3.5)
    area("PROOF_MAIN_FILL", (1.9, 2.30, .50), (0, 1.35, -2.4), 420, 2.0)
    main_cam = camera("PROOF_MAIN_CAMERA", (0, 1.68, 2.48), (0, 1.53, -2.40), 28)
    render(scene, main_cam, QA / "main-final.png")

    scene.view_settings.exposure = -1.15
    area("PROOF_CLOCK_KEY", (5.15, 2.25, .85), (6.27, 1.55, .36), 120, 1.25)
    area("PROOF_CLOCK_FILL", (5.55, 1.55, -.55), (6.27, 1.55, .36), 38, .8)
    clock_cam = camera("PROOF_CLOCK_CAMERA", (5.05, 1.57, -.06), (6.275, 1.56, .36), 54)
    render(scene, clock_cam, QA / "clock-final.png")


if __name__ == "__main__":
    main()
