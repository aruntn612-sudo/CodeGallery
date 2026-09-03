package com.tutorials.codegallery.repository;

import com.tutorials.codegallery.model.Tutorial;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TutorialRepository extends JpaRepository<Tutorial, Long> {}
