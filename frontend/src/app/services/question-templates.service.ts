import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Question } from './ceremonies.service';

export interface QuestionTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  questions: QuestionTemplateItem[];
  tags: string[];
}

export interface QuestionTemplateItem {
  text: string;
  question_type: string;
  help_text?: string;
  is_required: boolean;
  options?: QuestionTemplateOption[];
  min_value?: number;
  max_value?: number;
  min_label?: string;
  max_label?: string;
}

export interface QuestionTemplateOption {
  text: string;
  value: string;
}

@Injectable({
  providedIn: 'root'
})
export class QuestionTemplatesService {
  
  private templates: QuestionTemplate[] = [
    {
      id: 'daily-standup',
      name: 'Daily Stand-up',
      description: 'Standard questions for daily team stand-up meetings',
      category: 'Stand-up',
      tags: ['daily', 'standup', 'agile', 'scrum'],
      questions: [
        {
          text: 'What did you work on yesterday?',
          question_type: 'paragraph',
          help_text: 'Describe the main tasks and accomplishments from your previous work day',
          is_required: true
        },
        {
          text: 'What will you work on today?',
          question_type: 'paragraph',
          help_text: 'Outline your planned tasks and goals for today',
          is_required: true
        },
        {
          text: 'Are there any blockers or impediments?',
          question_type: 'paragraph',
          help_text: 'Describe any issues preventing you from making progress',
          is_required: false
        },
        {
          text: 'How are you feeling today?',
          question_type: 'linear_scale',
          help_text: 'Rate your current mood and energy level',
          is_required: false,
          min_value: 1,
          max_value: 10,
          min_label: 'Struggling',
          max_label: 'Thriving'
        },
        {
          text: 'Do you need help with anything?',
          question_type: 'checkboxes',
          help_text: 'Select all areas where you could use assistance',
          is_required: false,
          options: [
            { text: 'Technical guidance', value: 'technical' },
            { text: 'Resource allocation', value: 'resources' },
            { text: 'Process clarification', value: 'process' },
            { text: 'Team collaboration', value: 'collaboration' },
            { text: 'No help needed', value: 'none' }
          ]
        }
      ]
    },
    {
      id: 'sprint-planning',
      name: 'Sprint Planning',
      description: 'Questions for sprint planning and estimation sessions',
      category: 'Planning',
      tags: ['sprint', 'planning', 'estimation', 'agile'],
      questions: [
        {
          text: 'What are the main goals for this sprint?',
          question_type: 'paragraph',
          help_text: 'Describe the key objectives and deliverables',
          is_required: true
        },
        {
          text: 'Which user stories are ready for this sprint?',
          question_type: 'paragraph',
          help_text: 'List the stories that meet the Definition of Ready',
          is_required: true
        },
        {
          text: 'What is your team capacity for this sprint?',
          question_type: 'multiple_choice',
          help_text: 'Select the option that best represents your team\'s availability',
          is_required: true,
          options: [
            { text: 'Full capacity (100%)', value: '100' },
            { text: 'High capacity (80-90%)', value: '80-90' },
            { text: 'Medium capacity (60-80%)', value: '60-80' },
            { text: 'Low capacity (40-60%)', value: '40-60' },
            { text: 'Reduced capacity (<40%)', value: '<40' }
          ]
        },
        {
          text: 'What are the main risks for this sprint?',
          question_type: 'paragraph',
          help_text: 'Identify potential challenges and mitigation strategies',
          is_required: false
        },
        {
          text: 'Sprint confidence level',
          question_type: 'linear_scale',
          help_text: 'How confident are you that the team can complete the planned work?',
          is_required: true,
          min_value: 1,
          max_value: 5,
          min_label: 'Not confident',
          max_label: 'Very confident'
        }
      ]
    },
    {
      id: 'retrospective',
      name: 'Sprint Retrospective',
      description: 'Questions for team retrospectives and continuous improvement',
      category: 'Retrospective',
      tags: ['retrospective', 'improvement', 'feedback', 'agile'],
      questions: [
        {
          text: 'What went well during this sprint?',
          question_type: 'paragraph',
          help_text: 'Share positive experiences and successful practices',
          is_required: true
        },
        {
          text: 'What could have gone better?',
          question_type: 'paragraph',
          help_text: 'Identify areas for improvement and learning opportunities',
          is_required: true
        },
        {
          text: 'What actions will we take to improve?',
          question_type: 'paragraph',
          help_text: 'Propose specific changes for the next sprint',
          is_required: true
        },
        {
          text: 'Team collaboration rating',
          question_type: 'linear_scale',
          help_text: 'How would you rate the team\'s collaboration and communication?',
          is_required: false,
          min_value: 1,
          max_value: 10,
          min_label: 'Poor',
          max_label: 'Excellent'
        },
        {
          text: 'What tools or processes helped the most?',
          question_type: 'checkboxes',
          help_text: 'Select the most valuable tools and processes',
          is_required: false,
          options: [
            { text: 'Daily stand-ups', value: 'standups' },
            { text: 'Pair programming', value: 'pairing' },
            { text: 'Code reviews', value: 'reviews' },
            { text: 'Automated testing', value: 'testing' },
            { text: 'Documentation', value: 'docs' },
            { text: 'Team chat tools', value: 'chat' }
          ]
        }
      ]
    },
    {
      id: 'project-kickoff',
      name: 'Project Kickoff',
      description: 'Questions for new project initiation and team alignment',
      category: 'Kickoff',
      tags: ['kickoff', 'project', 'alignment', 'goals'],
      questions: [
        {
          text: 'What is the main objective of this project?',
          question_type: 'paragraph',
          help_text: 'Describe the primary goal and expected outcomes',
          is_required: true
        },
        {
          text: 'Who are the key stakeholders?',
          question_type: 'paragraph',
          help_text: 'List the main stakeholders and their roles',
          is_required: true
        },
        {
          text: 'What are the main project milestones?',
          question_type: 'paragraph',
          help_text: 'Outline the key deliverables and timeline',
          is_required: true
        },
        {
          text: 'What is your role in this project?',
          question_type: 'dropdown',
          help_text: 'Select your primary responsibility',
          is_required: true,
          options: [
            { text: 'Project Manager', value: 'pm' },
            { text: 'Developer', value: 'dev' },
            { text: 'Designer', value: 'designer' },
            { text: 'QA Engineer', value: 'qa' },
            { text: 'DevOps Engineer', value: 'devops' },
            { text: 'Business Analyst', value: 'ba' },
            { text: 'Other', value: 'other' }
          ]
        },
        {
          text: 'What concerns do you have about this project?',
          question_type: 'paragraph',
          help_text: 'Share any worries or potential challenges',
          is_required: false
        }
      ]
    },
    {
      id: 'weekly-checkin',
      name: 'Weekly Check-in',
      description: 'Questions for weekly team status and progress updates',
      category: 'Weekly',
      tags: ['weekly', 'progress', 'status', 'updates'],
      questions: [
        {
          text: 'What progress did you make this week?',
          question_type: 'paragraph',
          help_text: 'Summarize your key accomplishments and progress',
          is_required: true
        },
        {
          text: 'What are your priorities for next week?',
          question_type: 'paragraph',
          help_text: 'Outline your main goals and focus areas',
          is_required: true
        },
        {
          text: 'How would you rate your productivity this week?',
          question_type: 'linear_scale',
          help_text: 'Rate your overall productivity and effectiveness',
          is_required: false,
          min_value: 1,
          max_value: 10,
          min_label: 'Very low',
          max_label: 'Very high'
        },
        {
          text: 'What challenges did you face this week?',
          question_type: 'paragraph',
          help_text: 'Describe any obstacles or difficulties encountered',
          is_required: false
        },
        {
          text: 'What support do you need from the team?',
          question_type: 'checkboxes',
          help_text: 'Select the types of support you need',
          is_required: false,
          options: [
            { text: 'Technical assistance', value: 'technical' },
            { text: 'Resource allocation', value: 'resources' },
            { text: 'Process guidance', value: 'process' },
            { text: 'Team collaboration', value: 'collaboration' },
            { text: 'No support needed', value: 'none' }
          ]
        }
      ]
    }
  ];

  constructor() {}

  getTemplates(): Observable<QuestionTemplate[]> {
    return of(this.templates);
  }

  getTemplateById(id: string): Observable<QuestionTemplate | undefined> {
    const template = this.templates.find(t => t.id === id);
    return of(template);
  }

  getTemplatesByCategory(category: string): Observable<QuestionTemplate[]> {
    const filtered = this.templates.filter(t => t.category === category);
    return of(filtered);
  }

  searchTemplates(query: string): Observable<QuestionTemplate[]> {
    const lowerQuery = query.toLowerCase();
    const filtered = this.templates.filter(t => 
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
    return of(filtered);
  }

  getCategories(): Observable<string[]> {
    const categories = [...new Set(this.templates.map(t => t.category))];
    return of(categories);
  }

  getTags(): Observable<string[]> {
    const allTags = this.templates.flatMap(t => t.tags);
    const uniqueTags = [...new Set(allTags)];
    return of(uniqueTags);
  }
}
