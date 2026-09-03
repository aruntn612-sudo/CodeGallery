package com.tutorials.codegallery.service;

import com.tutorials.codegallery.model.Tutorial;
import com.tutorials.codegallery.repository.TutorialRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TutorialService {

    private final TutorialRepository tutorialRepository;

    public TutorialService(TutorialRepository tutorialRepository) {
        this.tutorialRepository = tutorialRepository;
    }

    public List<Tutorial> getAllTutorials() {
        return tutorialRepository.findAll();
    }

    public Tutorial getTutorialById(Long id) {
        return tutorialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tutorial not found with id: " + id));
    }

    public Tutorial saveTutorial(Tutorial tutorial) {
        return tutorialRepository.save(tutorial);
    }

    public Tutorial updateTutorial(Long id, Tutorial tutorial) {
        Tutorial existing = getTutorialById(id);
        existing.setTitle(tutorial.getTitle());
        existing.setLevel(tutorial.getLevel());
        existing.setContent(tutorial.getContent());
        return tutorialRepository.save(existing);
    }

    public void deleteTutorial(Long id) {
        Tutorial tutorial = getTutorialById(id);
        tutorialRepository.delete(tutorial);
    }
}
