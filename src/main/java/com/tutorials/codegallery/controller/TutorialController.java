package com.tutorials.codegallery.controller;

import com.tutorials.codegallery.model.Tutorial;
import com.tutorials.codegallery.service.TutorialService;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/tutorials")
public class TutorialController {

    private final TutorialService tutorialService;

    public TutorialController(TutorialService tutorialService) {
        this.tutorialService = tutorialService;
    }

    @GetMapping
    public List<Tutorial> getAllTutorials() {
        return tutorialService.getAllTutorials();
    }

    @GetMapping("/{id}")
    public Tutorial getTutorialById(@PathVariable Long id) {
        return tutorialService.getTutorialById(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'CO_USER')")
    public Tutorial addTutorial(@RequestBody Tutorial tutorial) {
        return tutorialService.saveTutorial(tutorial);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'CO_USER')")
    public Tutorial updateTutorial(@PathVariable Long id, @RequestBody Tutorial tutorial) {
        return tutorialService.updateTutorial(id, tutorial);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'CO_USER')")
    public void deleteTutorial(@PathVariable Long id) {
        tutorialService.deleteTutorial(id);
    }

    @PostMapping("/seed")
    public Tutorial addSampleTutorial() {
        Tutorial tutorial = new Tutorial();
        tutorial.setTitle("Spring Boot + MySQL");
        tutorial.setLevel("Beginner");
        tutorial.setContent("Create REST APIs and store tutorial records in MySQL.");
        return tutorialService.saveTutorial(tutorial);
    }
}
